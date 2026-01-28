import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInBusinessAQ1768991897611 implements MigrationInterface {
    name = 'AddExternalIdInBusinessAQ1768991897611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_questions"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_questions"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}