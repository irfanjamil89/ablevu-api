import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedToUserAccountStatusEnum1770981806329 implements MigrationInterface {
  name = "AddDeletedToUserAccountStatusEnum1770981806329";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        -- Check if enum type exists
        IF EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'user_account_status_enum'
        ) THEN

          -- Check if value already exists
          IF NOT EXISTS (
            SELECT 1
            FROM pg_enum e
            JOIN pg_type t ON t.oid = e.enumtypid
            WHERE t.typname = 'user_account_status_enum'
              AND e.enumlabel = 'Deleted'
          ) THEN

            ALTER TYPE user_account_status_enum ADD VALUE 'Deleted';

          END IF;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
