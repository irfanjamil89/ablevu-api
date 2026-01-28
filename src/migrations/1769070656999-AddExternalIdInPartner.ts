import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInPartner1769070656999 implements MigrationInterface {
    name = 'AddExternalIdInPartner1769070656999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "partner"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "partner"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}