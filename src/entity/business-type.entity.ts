import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Business } from './business.entity';

@Entity()
export class BusinessType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

    @Column()
    name: string;

    @ManyToMany(() => Business, (b) => b.businessTypes)
    businesses: Business[];

    @Column()
    display_order: number;

    @Column()
    picture_url: string;

    @Column()
    active: boolean;

    @Column()
    slug: string;

    @Column()
    created_by: string;

    @Column()
    modified_by: string;

    @Column()
    created_at: Date;

    @Column()
    modified_at: Date;
}