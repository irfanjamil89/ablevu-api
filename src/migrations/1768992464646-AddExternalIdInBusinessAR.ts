import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInBusinessAR1768992464646 implements MigrationInterface {
    name = 'AddExternalIdInBusinessAR1768992464646'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_resources"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_resources"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}