import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdColumn1763476636164 implements MigrationInterface {
    name = 'AddExternalIdColumn1763476636164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}