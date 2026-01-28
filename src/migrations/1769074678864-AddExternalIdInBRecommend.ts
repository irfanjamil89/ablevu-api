import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInBRecommend1769074678864 implements MigrationInterface {
    name = 'AddExternalIdInBRecommend1769074678864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_recomendations"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_recomendations"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}