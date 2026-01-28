import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInAC1768903862531 implements MigrationInterface {
    name = 'AddExternalIdInAC1768903862531'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "accessible_city"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "accessible_city"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}