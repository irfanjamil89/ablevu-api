import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClaimTable1765373459223 implements MigrationInterface {

    name = 'AddClaimTable1765373459223';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS claim_request (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                business_id UUID NOT NULL,
                user_id UUID NOT NULL,
                status VARCHAR(50) NOT NULL,
                amount NUMERIC(12,2) NOT NULL DEFAULT 0,
                is_paid BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                created_by UUID,
                updated_by UUID
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS claim_request;
        `);
    }
}
