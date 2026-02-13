import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCouponRuleColumns1770912442325 implements MigrationInterface {

    name = 'AddCouponRuleColumns1770912442325';

    public async up(queryRunner: QueryRunner): Promise<void> {

        // 1️⃣ Create ENUM type (if not exists)
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coupons_discount_type_enum') THEN
                    CREATE TYPE coupons_discount_type_enum AS ENUM ('percentage', 'fixed');
                END IF;
            END$$;
        `);

        // 2️⃣ Add discount_type column
        await queryRunner.query(`
            ALTER TABLE coupons
            ADD COLUMN IF NOT EXISTS discount_type coupons_discount_type_enum
            NOT NULL DEFAULT 'percentage';
        `);

        // 3️⃣ Add expires_at column
        await queryRunner.query(`
            ALTER TABLE coupons
            ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
        `);

        // 4️⃣ Add usage_limit column
        await queryRunner.query(`
            ALTER TABLE coupons
            ADD COLUMN IF NOT EXISTS usage_limit INTEGER;
        `);

        // 5️⃣ Add used_count column
        await queryRunner.query(`
            ALTER TABLE coupons
            ADD COLUMN IF NOT EXISTS used_count INTEGER NOT NULL DEFAULT 0;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            ALTER TABLE coupons DROP COLUMN IF EXISTS used_count;
        `);

        await queryRunner.query(`
            ALTER TABLE coupons DROP COLUMN IF EXISTS usage_limit;
        `);

        await queryRunner.query(`
            ALTER TABLE coupons DROP COLUMN IF EXISTS expires_at;
        `);

        await queryRunner.query(`
            ALTER TABLE coupons DROP COLUMN IF EXISTS discount_type;
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS coupons_discount_type_enum;
        `);
    }
}
