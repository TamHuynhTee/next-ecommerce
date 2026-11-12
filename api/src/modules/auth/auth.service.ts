import { Injectable } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { CredentialService } from './credential.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/common/interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly credentialService: CredentialService,
    private readonly jwtService: JwtService,
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

  async login(user: User) {
    const payload: JwtPayload = {
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        avatar: user.avatar,
      },
      sub: user.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
