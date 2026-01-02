import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStripeColumnsToCoupons1767358733149
  implements MigrationInterface
{
  public name = "AddStripeColumnsToCoupons1767358733149";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "coupons"
      ADD COLUMN IF NOT EXISTS "stripe_coupon_id" varchar(255),
      ADD COLUMN IF NOT EXISTS "stripe_promo_code_id" varchar(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "coupons"
      DROP COLUMN IF EXISTS "stripe_promo_code_id",
      DROP COLUMN IF EXISTS "stripe_coupon_id"
    `);
  }
}
