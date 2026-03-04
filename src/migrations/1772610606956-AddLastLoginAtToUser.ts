import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastLoginAtToUser1772610606956 implements MigrationInterface {
  name = 'AddLastLoginAtToUser1772610606956'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN "last_login_at" TIMESTAMPTZ NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_login_at"`);
  }
}