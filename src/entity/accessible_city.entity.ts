import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn ,UpdateDateColumn, OneToMany} from 'typeorm';
import { Business } from './business.entity';
@Entity()
export class AccessibleCity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  city_name: string;

  @Column()
  featured: boolean;

 @Column('decimal', { precision: 15, scale: 10, nullable: true }) 
  latitude?: number;

  @Column('decimal', { precision: 15, scale: 10, nullable: true }) 
  longitude?: number;

  @Column()
  display_order: number ;

  @Column()
  picture_url: string;

  @Column()
  slug: string;

  @Column()
  created_by: string;

  @Column()
  modified_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

}
