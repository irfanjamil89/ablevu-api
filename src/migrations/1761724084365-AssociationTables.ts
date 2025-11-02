import { MigrationInterface, QueryRunner } from "typeorm";

export class AssociationTables implements MigrationInterface {
    name = 'AssociationTables1761724084365'

     public async up(queryRunner: QueryRunner): Promise<void> {
  // accessible_city
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business_type (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name      TEXT NOT NULL,
        display_order  INTEGER,
        picture_url    TEXT,
        active         BOOLEAN NOT NULL DEFAULT TRUE,
        slug           TEXT UNIQUE,
        created_by     UUID REFERENCES "user"(id),
        modified_by    UUID REFERENCES "user"(id),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_business_type_slug ON business_type(slug);`);

       // // accessible_feature
    // // Using TEXT columns for category/type to avoid hard-coding long enums; can be normalized later.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business_linked_type (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id    UUID REFERENCES business(id),         
        business_type_id   UUID REFERENCES business_type(id),
        active           BOOLEAN NOT NULL DEFAULT TRUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // // business
    
     await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS accessible_feature_business_type (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        accessible_feature_id    UUID REFERENCES accessible_feature(id),         
        business_type_id   UUID REFERENCES business_type(id),
        active           BOOLEAN NOT NULL DEFAULT TRUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS accessible_feature_type (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name      TEXT NOT NULL,
        display_order  INTEGER,
        picture_url    TEXT,
        active         BOOLEAN NOT NULL DEFAULT TRUE,
        slug           TEXT UNIQUE,
        created_by     UUID REFERENCES "user"(id),
        modified_by    UUID REFERENCES "user"(id),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_accessible_feature_type_slug ON accessible_feature_type(slug);`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business_accessible_feature (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id    UUID REFERENCES business(id),         
        accessible_feature_id    UUID REFERENCES accessible_feature(id),
        optional_answer TEXT,
        active           BOOLEAN NOT NULL DEFAULT TRUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      ALTER TABLE accessible_feature
      DROP COLUMN IF EXISTS category;
    `);

    await queryRunner.query(`
      ALTER TABLE accessible_feature
      DROP COLUMN IF EXISTS feature_type;
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    

    await queryRunner.query(`DROP INDEX IF EXISTS idx_business_type_slug`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_accessible_feature_type_slug`);
    
    
    await queryRunner.query(`DROP TABLE IF EXISTS business_type`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_linked_type`);
    await queryRunner.query(`DROP TABLE IF EXISTS accessible_feature_business_type`);
    await queryRunner.query(`DROP TABLE IF EXISTS accessible_feature_type`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_accessible_feature`);
    await queryRunner.query(`
      ALTER TABLE accessible_feature
      ADD COLUMN IF NOT EXISTS category TEXT;
    `);

    await queryRunner.query(`
      ALTER TABLE accessible_feature
      ADD COLUMN IF NOT EXISTS feature_type TEXT;
    `);

  }
}