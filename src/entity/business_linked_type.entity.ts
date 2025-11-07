import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Business } from './business.entity';
import { BusinessType } from './business-type.entity';

@Entity()
export class BusinessLinkedType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
business: Business;

@ManyToOne(() => BusinessType, { onDelete: 'CASCADE' })
businessType: BusinessType;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  created_by?: string;

  @Column({ nullable: true })
  modified_by?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;
}
