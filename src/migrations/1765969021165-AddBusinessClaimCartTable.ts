import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBusinessClaimCartTable1765969021165 implements MigrationInterface {

    name = 'AddBusinessClaimCartTable1765969021165';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS business_claim_cart (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                business_id UUID NOT NULL,
                user_id UUID NOT NULL,
                batch_id VARCHAR(100) NOT NULL,
                amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
                status VARCHAR(30) NOT NULL DEFAULT 'pending',
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS business_claim_cart;
        `);
    }
}
