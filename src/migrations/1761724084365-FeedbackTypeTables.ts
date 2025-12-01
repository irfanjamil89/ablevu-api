import { MigrationInterface, QueryRunner } from "typeorm";

export class FeedbackTables implements MigrationInterface {
    name = 'FeedbackTypeTables1761724084365'

     public async up(queryRunner: QueryRunner): Promise<void> {
  // feedback_type
   await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS feedback_type (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name      TEXT NOT NULL,
        image_url    TEXT,
        active         BOOLEAN NOT NULL DEFAULT TRUE,
        created_by     UUID REFERENCES "user"(id),
        modified_by    UUID REFERENCES "user"(id),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id    UUID REFERENCES business(id),         
        feedback_type_id   UUID REFERENCES feedback_type(id),
        comment    TEXT,
        approved_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        active           BOOLEAN NOT NULL DEFAULT TRUE,
        created_by   UUID REFERENCES "user"(id),
        modified_by  UUID REFERENCES "user"(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    
    await queryRunner.query(`DROP TABLE IF EXISTS feedback`);
    await queryRunner.query(`DROP TABLE IF EXISTS feedback_type`);
  }
}