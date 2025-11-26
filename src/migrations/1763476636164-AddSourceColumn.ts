import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSourceColumn1763476636164 implements MigrationInterface {
    name = 'AddSourceColumn1763476636164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS "source" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            DROP COLUMN IF EXISTS "source";
        `);
    }
}