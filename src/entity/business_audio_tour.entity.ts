import { Business } from './business.entity';
import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';

@Entity('business_audio_tour')
export class BusinessAudioTour {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  link_url: string;

  @Column()
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
