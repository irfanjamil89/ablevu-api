import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStripeSubscriptionIdToSubscriptions1766860259175 implements MigrationInterface {
  name = "AddStripeSubscriptionIdToSubscriptions1766860259175";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE subscriptions
      ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id
      ON subscriptions(stripe_subscription_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_subscriptions_stripe_subscription_id;
    `);

    await queryRunner.query(`
      ALTER TABLE subscriptions
      DROP COLUMN IF EXISTS stripe_subscription_id;
    `);
  }
}
