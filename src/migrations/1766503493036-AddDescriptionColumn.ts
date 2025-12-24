import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDescriptionColumntoAccessibilityMedia1766503493036 implements MigrationInterface {
    public name = 'AddDescriptionColumn1766503493036';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        Alter Table "business_media"
        ADD COLUMN IF NOT EXISTS "description" text
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        Alter Table "business_media"
        DROP COLUMN IF EXISTS "description"
    `);
    }
}