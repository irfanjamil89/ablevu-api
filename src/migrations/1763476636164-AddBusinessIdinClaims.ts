import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBusinessIdinClaims1763476636164 implements MigrationInterface {
    name = 'AddBusinessIdinClaims1763476636164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "claims"
            ADD COLUMN IF NOT EXISTS "business_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "claims"
            DROP COLUMN IF EXISTS "business_id";
        `);
    }
}