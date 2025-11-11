import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class BusinessLinkedType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @Column({ type: 'uuid' })
  business_type_id: string;

  @Column()
  active: boolean;

  @Column()
  created_by?: string;

  @Column()
  modified_by?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;
}
