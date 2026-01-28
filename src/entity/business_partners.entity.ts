import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Partner } from './partner.entity';
import { Business } from './business.entity';

@Entity()
export class BusinessPartners {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    business_id: string;

    @ManyToOne(() => Business, (business) => business.partners, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'business_id' })
    business: Business;

    @ManyToOne(() => Partner, (partner) => partner.businessPartners, {
        eager: true, 
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'partner_id' })
    partner: Partner;

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

    @Column()
    external_id: string;
}