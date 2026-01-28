import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedReviewTypes1769082430522 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const items = [
            'Ease of Entry & Navigation',
            'Parking & Transportation',
            'Seating & Resting Areas',
            'Restroom Accessibility',
            'Sensory-Friendly Environment',
            'Staff Awareness & Assistance',
            'Digital & Communication Accessibility',
            'Service Animal Friendliness',
            'Adaptive Equipment Availability',
            'Overall Comfort & Experience',
            'Other'
        ];

        const systemUserId = '33b5d7bd-0c48-4df5-84d3-cbf059e94b02';

    for (const title of items) {
      await queryRunner.query(
        `
        INSERT INTO review_type (title, image_url, active, created_by, modified_by)
        VALUES ($1, $2, $3, $4, $5);
        `,
        [title, '', true, systemUserId, systemUserId],
      );
    }
  }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM review_type
            WHERE title IN (
                'Ease of Entry & Navigation',
                'Parking & Transportation',
                'Seating & Resting Areas',
                'Restroom Accessibility',
                'Sensory-Friendly Environment',
                'Staff Awareness & Assistance',
                'Digital & Communication Accessibility',
                'Service Animal Friendliness',
                'Adaptive Equipment Availability',
                'Overall Comfort & Experience',
                'Other'
            );
        `);
    }
}
