import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserAccountStatus1770883366820 implements MigrationInterface {

    name = 'AddUserAccountStatus1770883366820';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_type WHERE typname = 'user_account_status_enum'
                ) THEN
                    CREATE TYPE user_account_status_enum AS ENUM (
                        'Active',
                        'Inactive',
                        'Suspended'
                    );
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS account_status user_account_status_enum NOT NULL DEFAULT 'Active';
        `);

        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
        `);

        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS suspend_reason TEXT;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN IF EXISTS suspend_reason;
        `);

        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN IF EXISTS suspended_at;
        `);

        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN IF EXISTS account_status;
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS user_account_status_enum;
        `);
    }
}
