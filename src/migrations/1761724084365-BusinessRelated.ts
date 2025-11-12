import { MigrationInterface, QueryRunner } from "typeorm";

export class BusinessRelatedTables implements MigrationInterface {
  name = 'BusinessRelated1761724084365'

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business_virtual_tours (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name      TEXT NOT NULL,
        display_order  INTEGER,
        link_url    TEXT,
        business_id    UUID REFERENCES business(id),
        active         BOOLEAN NOT NULL DEFAULT TRUE,
        created_by     UUID REFERENCES "user"(id),
        modified_by    UUID REFERENCES "user"(id),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name      TEXT NOT NULL,
        description    TEXT,
        tags    TEXT,
        image_url    TEXT,
        business_id    UUID REFERENCES business(id),
        active         BOOLEAN NOT NULL DEFAULT TRUE,
        created_by     UUID REFERENCES "user"(id),
        modified_by    UUID REFERENCES "user"(id),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS partner (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name      TEXT NOT NULL,
        description    TEXT,
        tags    TEXT,
        image_url    TEXT,
        web_url    TEXT,
        active         BOOLEAN NOT NULL DEFAULT TRUE,
        created_by     UUID REFERENCES "user"(id),
        modified_by    UUID REFERENCES "user"(id),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business_partners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id    UUID REFERENCES business(id),         
        partner_id   UUID REFERENCES partner(id),
        active           BOOLEAN NOT NULL DEFAULT TRUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS review_type (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title      TEXT NOT NULL,
        image_url    TEXT,
        active         BOOLEAN NOT NULL DEFAULT TRUE,
        created_by     UUID REFERENCES "user"(id),
        modified_by    UUID REFERENCES "user"(id),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id    UUID REFERENCES business(id),         
        review_type_id   UUID REFERENCES review_type(id),
        description    TEXT,
        approved           BOOLEAN NOT NULL DEFAULT TRUE,
        approved_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        active           BOOLEAN NOT NULL DEFAULT TRUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business_reviews_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id    UUID REFERENCES business(id),
        description    TEXT,
        image_url    TEXT,
        active           BOOLEAN NOT NULL DEFAULT TRUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id    UUID REFERENCES business(id),
        answer    TEXT,
        question    TEXT,
        active           BOOLEAN NOT NULL DEFAULT TRUE,
        show_name           BOOLEAN NOT NULL DEFAULT TRUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business_resources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id    UUID REFERENCES business(id),
        label    TEXT,
        link    TEXT,
        active           BOOLEAN NOT NULL DEFAULT TRUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business_media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id    UUID REFERENCES business(id),
        label    TEXT,
        link    TEXT,
        active           BOOLEAN NOT NULL DEFAULT TRUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business_custom_sections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id    UUID REFERENCES business(id),
        label    TEXT,
        active           BOOLEAN NOT NULL DEFAULT TRUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business_custom_section_media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id    UUID REFERENCES business(id),
        business_custom_section_id    UUID REFERENCES business_custom_sections(id),
        label    TEXT,
        link    TEXT,
        active           BOOLEAN NOT NULL DEFAULT TRUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business_recomendations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id    UUID REFERENCES business(id),
        label          TEXT,
        active       BOOLEAN NOT NULL DEFAULT TRUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS business_schedule (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id    UUID REFERENCES business(id),
        day          TEXT,
        closing_time   TIMESTAMPTZ NOT NULL DEFAULT now(),
        opening_time   TIMESTAMPTZ NOT NULL DEFAULT now(),
        closing_time_text          TEXT,
        opening_time_text          TEXT,
        active       BOOLEAN NOT NULL DEFAULT TRUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code          TEXT,
        name          TEXT,
        validityMonths   integer,
        discount   NUMERIC(9,6),
        active       BOOLEAN NOT NULL DEFAULT TRUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notification (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content          TEXT,
        feedbackType          TEXT,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notification_receivers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content          TEXT,
        feedbackType          TEXT,
        read_status          BOOLEAN NOT NULL DEFAULT FALSE,
        notification_id   UUID REFERENCES notification(id),
        received_by   UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {



    await queryRunner.query(`DROP TABLE IF EXISTS notification_receivers`);
    await queryRunner.query(`DROP TABLE IF EXISTS notification`);
    await queryRunner.query(`DROP TABLE IF EXISTS coupons`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_schedule`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_recomendations`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_custom_section_media`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_custom_sections`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_media`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_resources`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_questions`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_reviews_images`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_reviews`);
    await queryRunner.query(`DROP TABLE IF EXISTS review_type`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_partners`);
    await queryRunner.query(`DROP TABLE IF EXISTS partner`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_images`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_virtual_tours`);
  }
}
