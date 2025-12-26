import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageColumntoBusinessReviews1766757486318 implements MigrationInterface {
    public name = 'AddImageColumn1766757486318';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        Alter Table "business_reviews"
        ADD COLUMN IF NOT EXISTS "image_url" text
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        Alter Table "business_reviews"
        DROP COLUMN IF EXISTS "image_url"
    `);
    }
}