import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdInCoupon1769172086357 implements MigrationInterface {
    name = 'AddExternalIdInCoupon1769172086357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "coupons"
            ADD COLUMN IF NOT EXISTS "external_id" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "coupons"
            DROP COLUMN IF EXISTS "external_id";
        `);
    }
}