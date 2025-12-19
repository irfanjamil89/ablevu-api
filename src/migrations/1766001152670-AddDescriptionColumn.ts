import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDescriptionColumntoCustomSectionMedia1766001152670 implements MigrationInterface {
    public name = 'AddDescriptionColumn1766001152669';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        Alter Table "business_custom_section_media"
        ADD COLUMN IF NOT EXISTS "description" text
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        Alter Table "business_custom_section_media"
        DROP COLUMN IF EXISTS "description"
    `);
    }
}

