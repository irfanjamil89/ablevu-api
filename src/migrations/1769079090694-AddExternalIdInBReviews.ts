import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInBReviews1769079090694 implements MigrationInterface {
    name = 'AddExternalIdInBReviews1769079090694'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_reviews"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_reviews"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}