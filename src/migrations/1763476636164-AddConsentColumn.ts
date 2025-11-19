import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConsentColumn1763476636164 implements MigrationInterface {
    name = 'AddConsentColumn1763476636164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS "consent" boolean NOT NULL DEFAULT false;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            DROP COLUMN IF EXISTS "consent";
        `);
    }
}