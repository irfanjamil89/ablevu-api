import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type DiscountType = 'percentage' | 'fixed';

@Entity()
export class Coupons {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  // ✅ percentage OR fixed
  @Column({
    type: 'enum',
    enum: ['percentage', 'fixed'],
  })
  discount_type: DiscountType;

  @Column({ type: 'int', default: 0 })
validitymonths: number;

  // ✅ amount (percent OR fixed value)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discount: number;

  // ✅ expiration date
  @Column({ type: 'timestamp', nullable: true })
  expires_at?: Date;

  // ✅ usage limit
  @Column({ type: 'int', nullable: true })
  usage_limit?: number;

  @Column({ default: 0 })
  used_count: number;

  @Column({ default: true })
  active: boolean;

  @Column()
  created_by: string;

  @Column()
  modified_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripe_coupon_id?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripe_promo_code_id?: string;

  @Column({ nullable: true })
  external_id: string;
}
