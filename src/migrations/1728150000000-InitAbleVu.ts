import { MigrationInterface, QueryRunner } from "typeorm";

export class InitAbleVu1728150000000 implements MigrationInterface {
  name = 'InitAbleVu1728150000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    // Enums (keep simple; widen later if needed)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('contributor','user','business','admin');
        END IF;
      END$$;
    `);

    // app_user
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name           TEXT,
        last_name            TEXT,
        email                TEXT UNIQUE,
        password             TEXT,
        hash                 TEXT,
        phone_number         TEXT,
        archived             BOOLEAN NOT NULL DEFAULT FALSE,
        paid_contributor     BOOLEAN NOT NULL DEFAULT FALSE,
        profile_picture_url  TEXT,
        customer_id          TEXT,
        seller_id            TEXT,
        user_role            TEXT,
        created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by UUID,
        updated_by UUID
      );
    `);

      
    await queryRunner.query(`
      INSERT INTO "user" (
  first_name, 
  last_name, 
  email, 
  password, 
  hash, 
  phone_number,
  archived, 
  paid_contributor, 
  user_role
)
VALUES (
  'Admin', 
  'User', 
  'admin@example.com',
  '$2b$12$QSfem3FGDVwM1IUSVmgdluAs6eajqdw05uCGcFg.qlwN95Q3BKVdu',
  'qlwN95Q3BKVdu',
  '+92-300-0000000',
  FALSE, 
  TRUE, 
  'Admin')`);
    
    // accessible_city
    // await queryRunner.query(`
    //   CREATE TABLE IF NOT EXISTS accessible_city (
    //     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    //     city_name      TEXT NOT NULL,
    //     featured       BOOLEAN NOT NULL DEFAULT FALSE,
    //     geog           geography(Point, 4326),
    //     display_order  INTEGER,
    //     picture_url    TEXT,
    //     slug           TEXT UNIQUE,
    //     created_by     UUID REFERENCES app_user(id),
    //     modified_by    UUID REFERENCES app_user(id),
    //     created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    //     modified_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    //   );
    // `);
    // await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_accessible_city_slug ON accessible_city(slug);`);

    // // accessible_feature
    // // Using TEXT columns for category/type to avoid hard-coding long enums; can be normalized later.
    // await queryRunner.query(`
    //   CREATE TABLE IF NOT EXISTS accessible_feature (
    //     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    //     category     TEXT,          -- e.g., "Amusement Park", "Airport", etc.
    //     title        TEXT NOT NULL,
    //     feature_type TEXT,          -- e.g., "physical", "dietary", "visual", "auditory"
    //     slug         TEXT UNIQUE,
    //     created_by   UUID REFERENCES app_user(id),
    //     modified_by  UUID REFERENCES app_user(id),
    //     created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    //     modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    //   );
    // `);
    // await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_accessible_feature_slug ON accessible_feature(slug);`);

    // // business
    // await queryRunner.query(`
    //   CREATE TABLE IF NOT EXISTS business (
    //     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    //     name              TEXT NOT NULL,
    //     slug              TEXT UNIQUE,
    //     description       TEXT,
    //     address           TEXT,
    //     city              TEXT,
    //     state             TEXT,
    //     country           TEXT,
    //     zipcode           TEXT,
    //     active            BOOLEAN NOT NULL DEFAULT TRUE,
    //     blocked           BOOLEAN NOT NULL DEFAULT FALSE,
    //     business_status   TEXT,
    //     subscription      TEXT,
    //     views             BIGINT NOT NULL DEFAULT 0,
    //     website           TEXT,
    //     email             TEXT,
    //     phone_number      TEXT,
    //     facebook_link     TEXT,
    //     instagram_link    TEXT,
    //     logo_url          TEXT,
    //     marker_image_url  TEXT,
    //     place_id          TEXT,
    //     geog              geography(Point, 4326),
    //     creator_user_id   UUID REFERENCES app_user(id),
    //     owner_user_id     UUID REFERENCES app_user(id),
    //     claimed_fee       NUMERIC(12,2),
    //     promo_code        TEXT,
    //     accessible_city_id UUID REFERENCES accessible_city(id),
    //     created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    //     modified_at       TIMESTAMPTZ NOT NULL DEFAULT now()
    //   );
    // `);
    // await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_business_slug ON business(slug);`);
    // await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_business_geog ON business USING GIST (geog);`);
    // await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_business_name_trgm ON business USING GIN (name gin_trgm_ops);`);
    // await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_business_city_trgm ON business USING GIN (city gin_trgm_ops);`);
    // await queryRunner.query(`
    //   CREATE INDEX IF NOT EXISTS idx_business_desc_fts ON business
    //   USING GIN (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,'')));
    // `);

    // // category + link
    // await queryRunner.query(`
    //   CREATE TABLE IF NOT EXISTS category (
    //     id   SERIAL PRIMARY KEY,
    //     name TEXT NOT NULL UNIQUE
    //   );
    // `);
    // await queryRunner.query(`
    //   CREATE TABLE IF NOT EXISTS business_category (
    //     business_id UUID REFERENCES business(id) ON DELETE CASCADE,
    //     category_id INT  REFERENCES category(id) ON DELETE RESTRICT,
    //     PRIMARY KEY (business_id, category_id)
    //   );
    // `);

    // // business pictures
    // await queryRunner.query(`
    //   CREATE TABLE IF NOT EXISTS business_picture (
    //     id BIGSERIAL PRIMARY KEY,
    //     business_id UUID REFERENCES business(id) ON DELETE CASCADE,
    //     url        TEXT NOT NULL,
    //     alt_text   TEXT,
    //     sort_order INT DEFAULT 0,
    //     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    //   );
    // `);

    // // business_accessible_feature (join with approval)
    // await queryRunner.query(`
    //   CREATE TABLE IF NOT EXISTS business_accessible_feature (
    //     business_id UUID REFERENCES business(id) ON DELETE CASCADE,
    //     feature_id  UUID REFERENCES accessible_feature(id) ON DELETE RESTRICT,
    //     approved    BOOLEAN NOT NULL DEFAULT FALSE,
    //     slug        TEXT,
    //     created_by  UUID REFERENCES app_user(id),
    //     modified_by UUID REFERENCES app_user(id),
    //     created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    //     modified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    //     PRIMARY KEY (business_id, feature_id)
    //   );
    // `);

    // // user_saved_business (favorites)
    // await queryRunner.query(`
    //   CREATE TABLE IF NOT EXISTS user_saved_business (
    //     user_id     UUID REFERENCES app_user(id) ON DELETE CASCADE,
    //     business_id UUID REFERENCES business(id) ON DELETE CASCADE,
    //     created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    //     PRIMARY KEY (user_id, business_id)
    //   );
    // `);

    // // collections
    // await queryRunner.query(`
    //   CREATE TABLE IF NOT EXISTS collection (
    //     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    //     user_id     UUID REFERENCES app_user(id) ON DELETE CASCADE,
    //     name        TEXT NOT NULL,
    //     description TEXT,
    //     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    //   );
    // `);
    // await queryRunner.query(`
    //   CREATE TABLE IF NOT EXISTS collection_business (
    //     collection_id UUID REFERENCES collection(id) ON DELETE CASCADE,
    //     business_id   UUID REFERENCES business(id) ON DELETE CASCADE,
    //     sort_order    INT DEFAULT 0,
    //     PRIMARY KEY (collection_id, business_id)
    //   );
    // `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse order
    // await queryRunner.query(`DROP TABLE IF EXISTS collection_business`);
    // await queryRunner.query(`DROP TABLE IF EXISTS collection`);
    // await queryRunner.query(`DROP TABLE IF EXISTS user_saved_business`);
    // await queryRunner.query(`DROP TABLE IF EXISTS business_accessible_feature`);
    // await queryRunner.query(`DROP TABLE IF EXISTS business_picture`);
    // await queryRunner.query(`DROP TABLE IF EXISTS business_category`);
    // await queryRunner.query(`DROP TABLE IF EXISTS category`);
    // await queryRunner.query(`DROP INDEX IF EXISTS idx_business_desc_fts`);
    // await queryRunner.query(`DROP INDEX IF EXISTS idx_business_city_trgm`);
    // await queryRunner.query(`DROP INDEX IF EXISTS idx_business_name_trgm`);
    // await queryRunner.query(`DROP INDEX IF EXISTS idx_business_geog`);
    // await queryRunner.query(`DROP INDEX IF EXISTS idx_business_slug`);
    // await queryRunner.query(`DROP TABLE IF EXISTS business`);
    // await queryRunner.query(`DROP INDEX IF EXISTS idx_accessible_feature_slug`);
    // await queryRunner.query(`DROP TABLE IF EXISTS accessible_feature`);
    // await queryRunner.query(`DROP INDEX IF EXISTS idx_accessible_city_slug`);
    // await queryRunner.query(`DROP TABLE IF EXISTS accessible_city`);
    await queryRunner.query(`DROP TABLE IF EXISTS app_user`);
   // await queryRunner.query(`DROP TYPE IF EXISTS user_role`);
    // keep extensions installed (safe no-ops to leave them)
  }
}
