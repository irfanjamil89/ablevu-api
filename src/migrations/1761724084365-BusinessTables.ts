import { MigrationInterface, QueryRunner } from "typeorm";

export class BusinessTables implements MigrationInterface {
    name = 'BusinessTables1761724084365'

     public async up(queryRunner: QueryRunner): Promise<void> {
  // accessible_city
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS accessible_city (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        city_name      TEXT NOT NULL,
        featured       BOOLEAN NOT NULL DEFAULT FALSE,
        latitude       NUMERIC(9,6),
        longitude      NUMERIC(9,6),
        display_order  INTEGER,
        picture_url    TEXT,
        slug           TEXT UNIQUE,
        created_by     UUID REFERENCES "user"(id),
        modified_by    UUID REFERENCES "user"(id),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_accessible_city_slug ON accessible_city(slug);`);

       // // accessible_feature
    // // Using TEXT columns for category/type to avoid hard-coding long enums; can be normalized later.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS accessible_feature (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category     TEXT,          -- e.g., "Amusement Park", "Airport", etc.
        title        TEXT NOT NULL,
        feature_type TEXT,          -- e.g., "physical", "dietary", "visual", "auditory"
        slug         TEXT UNIQUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_accessible_feature_slug ON accessible_feature(slug);`);

    // // business
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name              TEXT NOT NULL,
        slug              TEXT UNIQUE,
        description       TEXT,
        address           TEXT,
        city              TEXT,
        state             TEXT,
        country           TEXT,
        zipcode           TEXT,
        active            BOOLEAN NOT NULL DEFAULT TRUE,
        blocked           BOOLEAN NOT NULL DEFAULT FALSE,
        business_status   TEXT,
        subscription      TEXT,
        views             BIGINT NOT NULL DEFAULT 0,
        website           TEXT,
        email             TEXT,
        phone_number      TEXT,
        facebook_link     TEXT,
        instagram_link    TEXT,
        logo_url          TEXT,
        marker_image_url  TEXT,
        place_id          TEXT,
        latitude       NUMERIC(9,6),
        longitude      NUMERIC(9,6),
        creator_user_id   UUID REFERENCES "user"(id),
        owner_user_id     UUID REFERENCES "user"(id),
        claimed_fee       NUMERIC(12,2),
        promo_code        TEXT,
        accessible_city_id UUID REFERENCES accessible_city(id),
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_business_slug ON business(slug);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_business_name_trgm ON business USING GIN (name gin_trgm_ops);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_business_city_trgm ON business USING GIN (city gin_trgm_ops);`);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_business_desc_fts ON business
      USING GIN (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,'')));
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    
    await queryRunner.query(`DROP INDEX IF EXISTS idx_business_desc_fts`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_business_city_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_business_name_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_business_geog`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_business_slug`);
    await queryRunner.query(`DROP TABLE IF EXISTS business`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_accessible_feature_slug`);
    await queryRunner.query(`DROP TABLE IF EXISTS accessible_feature`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_accessible_city_slug`);
    await queryRunner.query(`DROP TABLE IF EXISTS accessible_city`);
  }
}