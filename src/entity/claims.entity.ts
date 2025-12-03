import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
@Entity()
export class Claims {
  @PrimaryGeneratedColumn('uuid')
  claim_id: string;

  @Column()
  listing_id: string;
 
  @Column()
  business_id: string;

  @Column()
  listing_name: string;

  @Column() 
  owner_email?: string;
  
  @Column() 
  status?: string;
  
  @Column()
  owner_name?: string;

  @Column()
  phone?: string;

  @Column()
  source?: string;

  @Column() 
  requested_on?: Date;
  
  @Column() 
  decision_on?: Date;
  

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

}
