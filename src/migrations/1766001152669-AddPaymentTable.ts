import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentTable1766001152669 implements MigrationInterface {

    name = 'AddPaymentTable1766001152669';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                batch_id VARCHAR(100) NOT NULL,
                amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
                status VARCHAR(30) NOT NULL DEFAULT 'pending',
                payment_date TIMESTAMPTZ,
                success_at TIMESTAMPTZ,
                cancel_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS payments;
        `);
    }
}
