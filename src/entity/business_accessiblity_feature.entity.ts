import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Business } from './business.entity';
import { AccessibleFeature } from './accessible_feature.entity';

@Entity('business_accessible_feature')
export class BusinessAccessibleFeature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ------- FK column + relation: business -------
  @Column({ type: 'uuid' })
  business_id: string;

  @ManyToOne(() => Business, (business) => business.accessibleFeatures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  // ------- FK column + relation: accessible_feature -------
  @Column({ type: 'uuid' })
  accessible_feature_id: string;

  @ManyToOne(
    () => AccessibleFeature,
    (feature) => feature.businessAccessibleFeatures,
    {
      onDelete: 'CASCADE',
      eager: true,
    },
  )
  @JoinColumn({ name: 'accessible_feature_id' })
  accessible_feature: AccessibleFeature;

  @Column({ type: 'text', nullable: true })
  optional_answer: string | null;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'uuid' })
  created_by: string;

  @Column({ type: 'uuid' })
  modified_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;
}
