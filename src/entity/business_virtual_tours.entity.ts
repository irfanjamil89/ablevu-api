import { IsUUID } from 'class-validator';
import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,} from 'typeorm';

@Entity('business_virtual_tours')
export class BusinessVirtualTour {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  display_order: number;

  @Column()
  link_url: string;

  @Column()
  @IsUUID()
  business_id: string; 

  @Column()
  active: boolean;

  @Column()
  created_by: string;

  @Column()
  modified_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;
}
