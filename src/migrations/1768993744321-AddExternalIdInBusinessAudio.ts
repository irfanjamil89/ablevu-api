import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInBusinessAudio1768993744321 implements MigrationInterface {
    name = 'AddExternalIdInBusinessAAudio1768993744321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_audio_tour"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "business_audio_tour"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}