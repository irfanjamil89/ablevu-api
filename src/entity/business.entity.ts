import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany } from 'typeorm';
import { BusinessType } from './business-type.entity';


@Entity()
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => BusinessType, (bt) => bt.businesses)

  @JoinTable({
    name: 'business_linked_type', 
    joinColumn: {
      name: 'business_id', 
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'business_type_id', 
      referencedColumnName: 'id', 
    },
  })

  businessTypes: BusinessType[];
  @Column()
  slug: string;

  @Column() 
  description?: string;
  
  @Column() 
  address?: string;
  
  @Column()
  city?: string;

  @Column()
  state?: string;

  @Column()
  country?: string;

  @Column()
  zipcode?: string;
  
  @Column() 
  active: boolean;

  @Column() 
  blocked: boolean;

  @Column() 
  business_status?: string;
  
  @Column() 
  subscription?: string;

  @Column() views: number;

  @Column() 
  website?: string;
  
  @Column() 
  email?: string;
  
  @Column() 
  phone_number?: string;

  @Column() 
  facebook_link?: string;
  
  @Column() 
  instagram_link?: string;

  @Column() 
  logo_url?: string;

  @Column() 
  marker_image_url?: string;

  @Column() 
  place_id?: string;

  @Column() 
  latitude?: number;

  @Column() 
  longitude?: number;

  @Column({ name: 'creator_user_id', type: 'uuid' })
  creatorUserId: string;

  @Column({ name: 'owner_user_id', type: 'uuid' })
  ownerUserId: string;

  @Column() 
  claimed_fee?: string;
  
  @Column() 
  promo_code?: string;

  @Column()
  created_at?: Date;

  @Column()
  modified_at?: Date;

}
