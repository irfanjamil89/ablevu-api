import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
@Entity()
export class ListingsVerified {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  business_id: string;
 
  @Column()
  listing_id?: string;

  @Column() 
  name?: string;
  
  @Column() 
  address?: string;
  
  @Column()
  city?: string;

  @Column()
  city_state?: string;

  @Column()
  features?: string;

  @Column()
  virtual_tour_url?: string;
  
  @Column() 
  profile_url: string;

  @Column() 
  suggest_edit_url: string;

  @Column() 
  last_verified?: Date;
  
  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  @Column()
  business_types: string;

}
