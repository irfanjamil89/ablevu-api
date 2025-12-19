import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type SubscriptionStatus =
  | 'pending'

  | 'paid'
  | 'canceled'
  | 'failed'
  | 'past_due';

@Entity({ name: 'subscriptions' })
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  amount: string;

  // NOTE: "package" reserved word vibes; DB column name same, property keep packageName
  @Column({ name: 'package', type: 'varchar', length: 50 })
  packageName: string; // monthly/yearly/etc

  @Column({ name: 'price_id', type: 'varchar', length: 255 })
  priceId: string;

  @Column({ type: 'timestamptz', nullable: true })
  start_date?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  end_date?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  discount_code?: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  discount_amount: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id: string;

  @Index()
    @Column({ type: 'uuid', nullable: true })
    business_id: string | null;


  @Column({ type: 'varchar', length: 30, default: 'pending' })
  status: SubscriptionStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payment_reference?: string; // session_id / subscription_id

  @Column({ type: 'varchar', length: 255, nullable: true })
  invoice_id?: string;

  @Column({ type: 'timestamptz', nullable: true })
  success_at?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  cancel_at?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
