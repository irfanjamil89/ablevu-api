import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInFeedback1769169011741 implements MigrationInterface {
    name = 'AddExternalIdInFeedback1769169011741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "feedback"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "feedback"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}