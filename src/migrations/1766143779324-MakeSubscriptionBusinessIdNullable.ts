import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeSubscriptionBusinessIdNullable1766143779324 implements MigrationInterface {
  name = "MakeSubscriptionBusinessIdNullable1766143779324";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE subscriptions
      ALTER COLUMN business_id DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE subscriptions
      ALTER COLUMN business_id SET NOT NULL;
    `);
  }
}
