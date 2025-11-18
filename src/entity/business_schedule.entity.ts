import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Business } from "./business.entity";

@Entity('business_schedule')
export class BusinessSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Business, (b) => b.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column()
  day: string; 

  @Column({ type: 'timestamptz' })
  opening_time: Date;

  @Column({ type: 'timestamptz' })
  closing_time: Date;

  @Column()
  opening_time_text: string;

  @Column()
  closing_time_text: string;

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
