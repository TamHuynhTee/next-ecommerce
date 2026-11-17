import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { IsNull, Repository } from 'typeorm';
import { ERROR_CODE } from 'src/common/constants/error-code';
import { JwtPayload } from 'src/common/interfaces';
import { AppConfig } from 'src/config/configuration';
import { User } from '../users/entities/user.entity';
import { UserService } from '../users/users.service';
import { CredentialService } from './credential.service';
import { RefreshToken } from './entities/refresh-token.entity';

export type AuthTokens = { access_token: string; refresh_token: string };

/**
 * A refresh token that was just rotated may legitimately be presented again
 * (parallel requests from one browser all see the expired access token).
 * Within this window the reuse is tolerated; after it, reuse revokes the family.
 */
const ROTATION_GRACE_MS = 10_000;
const DAY_MS = 24 * 60 * 60 * 1000;

const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly credentialService: CredentialService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (
      user &&
      (await this.credentialService.verify(password, user.hashedPassword))
    ) {
      return new User(user);
    }
    return null;
  }

  /** Starts a new session (token family) for the user. */
  async login(user: User): Promise<AuthTokens> {
    return this.issueTokens(user, randomUUID());
  }

  /**
   * Exchanges a refresh token for a new access/refresh pair (rotation).
   * The user is reloaded so role or profile changes take effect on refresh.
   */
  async refresh(rawToken: string): Promise<AuthTokens> {
    const stored = await this.refreshRepo.findOneBy({
      tokenHash: hashToken(rawToken),
    });
    const now = Date.now();

    if (!stored || stored.revokedAt || stored.expiresAt.getTime() <= now) {
      throw this.invalidToken();
    }

    if (stored.rotatedAt) {
      if (now - stored.rotatedAt.getTime() > ROTATION_GRACE_MS) {
        // A rotated token was replayed outside the grace window: assume theft.
        await this.revokeFamily(stored.familyId);
        throw this.invalidToken();
      }
    } else {
      await this.refreshRepo.update(stored.id, { rotatedAt: new Date() });
    }

    const user = await this.userService.findById(stored.userId);
    if (!user) {
      await this.revokeFamily(stored.familyId);
      throw this.invalidToken();
    }
    return this.issueTokens(new User(user), stored.familyId);
  }

  /** Revokes the session the refresh token belongs to. Unknown tokens are ignored. */
  async signOut(rawToken: string): Promise<void> {
    const stored = await this.refreshRepo.findOneBy({
      tokenHash: hashToken(rawToken),
    });
    if (stored) await this.revokeFamily(stored.familyId);
  }

  private async issueTokens(user: User, familyId: string): Promise<AuthTokens> {
    const payload: JwtPayload = {
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
      },
      sub: user.id,
    };

    const refreshToken = randomBytes(48).toString('base64url');
    const days = this.config.get('jwt.refresh_expires_in_days', {
      infer: true,
    });
    await this.refreshRepo.save(
      this.refreshRepo.create({
        userId: user.id,
        familyId,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + days * DAY_MS),
      }),
    );

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
    };
  }

  private async revokeFamily(familyId: string) {
    await this.refreshRepo.update(
      { familyId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private invalidToken() {
    return new UnauthorizedException(ERROR_CODE.INVALID_REFRESH_TOKEN);
  }
}
