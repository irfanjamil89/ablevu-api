import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInAFColumn1763476636164 implements MigrationInterface {
    name = 'AddExternalIdInAFColumn1763476636164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "accessible_feature"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "accessible_feature"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}