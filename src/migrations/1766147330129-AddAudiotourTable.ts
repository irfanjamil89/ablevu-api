import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAudiotourTable1766147330129 implements MigrationInterface {

    name = 'AddAudiotourTable1766147330129';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS business_audio_tour (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name      TEXT NOT NULL,
             link_url    TEXT,
             business_id UUID REFERENCES business(id),
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
            DROP TABLE IF EXISTS business_audio_tour ;
        `);
    }
}