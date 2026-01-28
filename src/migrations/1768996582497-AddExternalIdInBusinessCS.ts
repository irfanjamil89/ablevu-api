import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInBusinessCS1768996582497 implements MigrationInterface {
    name = 'AddExternalIdInBusinessCS1768996582497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_custom_sections"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_custom_sections"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}