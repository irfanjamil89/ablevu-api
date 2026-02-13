import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBusinessTypesToListingsVerified1770984793018 implements MigrationInterface {
  name = "AddBusinessTypesToListingsVerified1770984793018";

  public async up(queryRunner: QueryRunner): Promise<void> {
    
    await queryRunner.query(`
      ALTER TABLE listings_verified
      ADD COLUMN IF NOT EXISTS business_types TEXT;
    `);
    }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE listings_verified
      DROP COLUMN IF EXISTS business_types;
    `);
  }
}
