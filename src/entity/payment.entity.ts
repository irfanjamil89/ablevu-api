import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity({ name: "payments" })
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  user_id: string;

  @Column({ type: "varchar", length: 100 })
  @Index()
  batch_id: string;

  @Column({ type: "numeric", precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: "varchar", length: 30, default: "pending" })
  status: string;

  @Column({ type: "timestamptz", nullable: true })
  payment_date: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  success_at: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  cancel_at: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  modified_at: Date;
}
