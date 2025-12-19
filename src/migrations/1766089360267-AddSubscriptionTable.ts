import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubscriptionTable1766089360267 implements MigrationInterface {

    name = 'AddSubscriptionTable1766089360267';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS subscriptions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
                package VARCHAR(50) NOT NULL,
                price_id VARCHAR(255) NOT NULL,
                start_date TIMESTAMPTZ,
                end_date TIMESTAMPTZ,
                discount_code VARCHAR(100),
                discount_amount NUMERIC(10,2) DEFAULT 0.00,
                user_id UUID NOT NULL,
                business_id UUID NOT NULL,
                status VARCHAR(30) NOT NULL DEFAULT 'pending',
                payment_reference VARCHAR(255),
                invoice_id VARCHAR(255),
                success_at TIMESTAMPTZ,
                cancel_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS subscriptions;
        `);
    }
}
