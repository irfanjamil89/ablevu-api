import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Coupons {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column()
  validitymonths: string;

  @Column()
  discount: string;

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
}
