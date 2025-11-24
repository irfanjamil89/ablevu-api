import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAccessibleFeatureLink1761724084370 implements MigrationInterface {

    name = 'AddAccessibleFeatureLink1761724084370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS accessible_feature_linked_type (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                accessible_feature_id UUID REFERENCES accessible_feature(id),
                accessible_feature_type_id UUID REFERENCES accessible_feature_type(id),
                active BOOLEAN NOT NULL DEFAULT TRUE,
                created_by UUID REFERENCES "user"(id),
                modified_by UUID REFERENCES "user"(id),
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS accessible_feature_linked_type;
        `);
    }
}
