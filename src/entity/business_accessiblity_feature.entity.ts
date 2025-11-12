import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class BusinessAccessibleFeature {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    business_id: string;

    @Column({ type: 'uuid' })
    accessible_feature_id: string;

    @Column()
    optional_answer: string;

    @Column()
    active: boolean;

    @Column()
    created_by: string;

    @Column()
    modified_by: string;

    @Column()
    created_at: Date;

    @Column()
    modified_at: Date;

}