import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedFeedbackTypes1769083211762 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const items = [
            'Results aren’t relevant',
            'Request to add a specific business',
            'Duplicate Business',
            'Suggest an improvement',
            'Report a bug',
            'Any other feedback'
    ];

        const systemUserId = '33b5d7bd-0c48-4df5-84d3-cbf059e94b02';

    for (const name of items) {
      await queryRunner.query(
        `
        INSERT INTO feedback_type (name, image_url, active, created_by, modified_by)
        VALUES ($1, $2, $3, $4, $5);
        `,
        [name, '', true, systemUserId, systemUserId],
      );
    }
  }
    public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM feedback_type
      WHERE title IN (
        'Results aren’t relevant',
        'Request to add a specific business',
        'Duplicate Business',
        'Suggest an improvement',
        'Report a bug',
        'Any other feedback'
      )
    `);
  }
}
