import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInBP1769071899694 implements MigrationInterface {
    name = 'AddExternalIdInBP1769071899694'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_partners"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_partners"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}