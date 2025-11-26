import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class BusinessPartners {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    business_id: string;

    @Column({ type: 'uuid' })
    partner_id: string;

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