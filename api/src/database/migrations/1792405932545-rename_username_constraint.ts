import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUsernameConstraint1792405932545 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "public"."users"
        RENAME CONSTRAINT "u_username_constraint"
        TO "uq_username_constraint"
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "public"."users"
    RENAME CONSTRAINT "uq_users_username"
    TO "u_username_constraint"
  `);
  }
}
