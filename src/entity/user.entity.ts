import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
export enum AccountStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  SUSPENDED = "Suspended",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name?: string;

  @Column()
  last_name?: string;

  @Column()
  password?: string;

  @Column()
  public email?: string;

  @Column()
  phone_number?: string;

  @Column()
  archived?: Boolean;

  @Column()
  paid_contributor?: Boolean;

  @Column()
  profile_picture_url?: string;

  @Column()
  customer_id?: string;

  @Column()
  seller_id?: string;

  @Column()
  user_role?: string;

  @Column()
  created_at?: Date;

  @Column()
  modified_at?: Date;

  @Column()
  external_id?: string;

  @Column({ type: 'varchar', length: 128, nullable: true, name: 'reset_token' })
  resetToken: string | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'reset_token_expires' })
  resetTokenExpires: Date | null;

  @Column()
  consent: boolean;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string | null;

  @Column()
  source: string;
//   @Column({ default: true })
//   isActive: boolean;

  @Column({
    type: "enum",
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  account_status: AccountStatus;

  @Column({ type: "timestamptz", nullable: true })
  suspended_at?: Date | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  suspend_reason?: string | null;
}