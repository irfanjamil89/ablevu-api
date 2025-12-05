import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { BusinessVirtualTour } from './business_virtual_tours.entity';
import { BusinessSchedule } from './business_schedule.entity';
import { BusinessRecomendations } from './business_recomendations.entity';
import { BusinessAccessibleFeature } from './business_accessiblity_feature.entity';
import { BusinessPartners } from './business_partners.entity';

@Entity()
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

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

  @Column('decimal', { precision: 15, scale: 10, nullable: true })
  latitude?: number;

  @Column('decimal', { precision: 15, scale: 10, nullable: true })
  longitude?: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'creator_user_id' })
  creator: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'owner_user_id' })
  owner: User;

  @Column()
  claimed_fee?: string;
  
  @Column() 
  external_id?: string;

  @Column() 
  promo_code?: string;

  @Column({ type: 'uuid', nullable: true })
  accessible_city_id: string | null;

  @Column()
  created_at: Date;

  @Column()
  modified_at: Date;

  @OneToMany(() => BusinessVirtualTour, (tour) => tour.business)
  virtualTours: BusinessVirtualTour[];

  @OneToMany(() => BusinessSchedule, (s) => s.business)
  schedules: BusinessSchedule[];

  @OneToMany(() => BusinessRecomendations, (r) => r.business)
  recomendations: BusinessRecomendations[];

  @OneToMany(() => BusinessAccessibleFeature, (bf) => bf.business)
accessibleFeatures: BusinessAccessibleFeature[];

@OneToMany(() => BusinessPartners, (bp) => bp.business)
partners: BusinessPartners[];

}
