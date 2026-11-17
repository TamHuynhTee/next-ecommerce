import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokens1792600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" (
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "token_hash" character varying(64) NOT NULL,
        "family_id" uuid NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "rotated_at" TIMESTAMP,
        "revoked_at" TIMESTAMP,
        CONSTRAINT "pk_refresh_tokens_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_refresh_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_uq_refresh_token_hash" ON "refresh_tokens" ("token_hash")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_refresh_token_family" ON "refresh_tokens" ("family_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_refresh_token_family"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_uq_refresh_token_hash"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
  }
}
