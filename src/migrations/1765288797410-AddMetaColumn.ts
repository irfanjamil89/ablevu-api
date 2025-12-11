import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMetaColumnToNotifications1765288797410 implements MigrationInterface {
  public name = 'AddMetaColumnToNotifications1765288797410';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notification"
      ADD COLUMN IF NOT EXISTS "meta" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notification"
      DROP COLUMN IF EXISTS "meta"
    `);
  }
}
