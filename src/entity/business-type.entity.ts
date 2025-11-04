import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class BusinessType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

    @Column()
    name: string;

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