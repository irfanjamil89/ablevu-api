import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInBusiness1763476636164 implements MigrationInterface {
    name = 'AddExternalIdInBusiness1763476636164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}