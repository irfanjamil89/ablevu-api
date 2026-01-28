import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInBusinessAM1768989497440 implements MigrationInterface {
    name = 'AddExternalIdInBusinessAM1768989497440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_media"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_media"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}