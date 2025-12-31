import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBusinessDraftTable1766759424757 implements MigrationInterface {

    name = 'AddBusinessDraftTable1766759424757';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS business_drafts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,

                status VARCHAR(30) NOT NULL DEFAULT 'pending',
                -- pending | completed | cancelled | expired | failed

                payload JSONB NOT NULL,
                image_base64 TEXT,

                stripe_session_id VARCHAR(255),
                stripe_subscription_id VARCHAR(255),

                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_business_drafts_user_id
            ON business_drafts(user_id);
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_business_drafts_stripe_session_id
            ON business_drafts(stripe_session_id);
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_business_drafts_stripe_subscription_id
            ON business_drafts(stripe_subscription_id);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS business_drafts;
        `);
    }
}
