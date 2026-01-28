import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInSubscription1769611812962 implements MigrationInterface {
    name = 'AddExternalIdInSubscription1769611812962'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "subscriptions"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "subscriptions"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}