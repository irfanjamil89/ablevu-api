import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResetTokenColumns1761724084365 implements MigrationInterface {
    name = 'AddResetTokenColumns1761724084365'

     public async up(queryRunner: QueryRunner): Promise<void> {
    // table name is "user" per your error log
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS "reset_token" varchar(128),
      ADD COLUMN IF NOT EXISTS "reset_token_expires" timestamptz
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      DROP COLUMN IF NOT EXISTS "reset_token_expires",
      DROP COLUMN IF NOT EXISTS "reset_token"
    `);
  }
}