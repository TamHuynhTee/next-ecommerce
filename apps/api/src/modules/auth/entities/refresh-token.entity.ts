import { CoreEntity } from 'src/entities/core.entity';
import { Column, Entity, Index } from 'typeorm';

export const INDEX_UNIQUE_REFRESH_TOKEN_HASH = 'idx_uq_refresh_token_hash';

/**
 * Server-side record of an issued refresh token. Only a SHA-256 hash of the
 * token is stored, so a database leak does not expose usable tokens.
 * Tokens that descend from the same sign-in share a `familyId`, which allows
 * revoking the whole chain on sign-out or on detected token reuse.
 */
@Entity({ name: 'refresh_tokens' })
@Index(INDEX_UNIQUE_REFRESH_TOKEN_HASH, ['tokenHash'], { unique: true })
@Index('idx_refresh_token_family', ['familyId'])
export class RefreshToken extends CoreEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 64, name: 'token_hash' })
  tokenHash: string;

  @Column({ type: 'uuid', name: 'family_id' })
  familyId: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;

  /** Set when this token was exchanged for a new one. */
  @Column({ type: 'timestamp', name: 'rotated_at', nullable: true })
  rotatedAt: Date | null;

  /** Set when the token family was revoked (sign-out or reuse detection). */
  @Column({ type: 'timestamp', name: 'revoked_at', nullable: true })
  revokedAt: Date | null;
}
