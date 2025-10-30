import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

    @Column({ type: 'varchar', length: 128, nullable: true, name: 'reset_token' })
  resetToken: string | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'reset_token_expires' })
  resetTokenExpires: Date | null;

 @Column({ type: 'uuid', nullable: true })
  created_by?: string | null;;
//   @Column({ default: true })
//   isActive: boolean;
}