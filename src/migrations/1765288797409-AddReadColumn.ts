import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReadColumn1765288797409 implements MigrationInterface {
  public name = 'AddReadColumn1765288797409';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notification"
      ADD COLUMN IF NOT EXISTS "read" boolean DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notification"
      DROP COLUMN IF NOT EXISTS "read"
    `);
  }
}
