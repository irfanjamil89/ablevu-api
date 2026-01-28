import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInBusinessImages1768998418687 implements MigrationInterface {
    name = 'AddExternalIdInBusinessImages1768998418687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_images"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_images"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}