import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInBSchedule1769076155801 implements MigrationInterface {
    name = 'AddExternalIdInBSchedule1769076155801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_schedule"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_schedule"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}