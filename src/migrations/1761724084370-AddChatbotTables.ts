import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChatbotTables1761724084370 implements MigrationInterface {

    name = 'AddChatbotTables1761724084370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
           CREATE TABLE IF NOT EXISTS listings_verified (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                business_id       UUID REFERENCES business(id), 
                listing_id        TEXT,                 -- Bubble business id (normalized)
                name              TEXT NOT NULL,
                address           TEXT,
                city              TEXT,                              -- raw city (for filtering)
                city_state        TEXT,                              -- e.g., "Ann Arbor, MI"
                features          TEXT,                              -- pipe-joined: "Step-free entrance|Quiet area|..."
                virtual_tour_url  TEXT,
                profile_url       TEXT,
                suggest_edit_url  TEXT,
                last_verified     DATE,                              -- ISO date
                created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
        `);

        await queryRunner.query(`
           CREATE TABLE IF NOT EXISTS public_snippets (
  id            BIGSERIAL PRIMARY KEY,
  listing_name  TEXT NOT NULL,
  address       TEXT,
  city          TEXT,
  source_label  TEXT,         -- e.g., "Google Maps", "Yelp"
  source_url    TEXT,
  info_line     TEXT,         -- short note, may contain keywords like "ramp", etc.
  capture_date  DATE,         -- used for freshness (<= 12 months)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
        `);

        await queryRunner.query(`
           CREATE TABLE IF NOT EXISTS listings_owner_submitted (
  id            BIGSERIAL PRIMARY KEY,
  listing_id    TEXT,          -- if the owner references an existing business id
  name          TEXT NOT NULL,
  address       TEXT,
  city          TEXT,
  features      TEXT,          -- optional, pipe-joined text
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
        `);

         await queryRunner.query(`
           CREATE TABLE IF NOT EXISTS claims (
  claim_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    TEXT,                     -- may be NULL if user claimed by name only
  listing_name  TEXT NOT NULL,
  owner_email   TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'Draft',
  requested_on  DATE DEFAULT CURRENT_DATE,
  decision_on   DATE,                     -- set on approve/reject
  owner_name    TEXT,
  phone         TEXT,
  source        TEXT DEFAULT 'web',       -- 'web' | 'chat' | other
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
); `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS claims;
        `);
        await queryRunner.query(`
            DROP TABLE IF EXISTS listings_owner_submitted;
        `);
        await queryRunner.query(`
            DROP TABLE IF EXISTS public_snippets;
        `);
        await queryRunner.query(`
            DROP TABLE IF EXISTS listings_verified;
        `);
    }
}
