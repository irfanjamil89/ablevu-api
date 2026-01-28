import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInBusinessCSM1768995476228 implements MigrationInterface {
    name = 'AddExternalIdInBusinessCSM1768995476228'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_custom_section_media"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_custom_section_media"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}