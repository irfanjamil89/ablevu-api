import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("business_claim_cart")
export class BusinessClaimCart {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  business_id: string;

  @Column({ type: "uuid" })
  user_id: string;

  @Column({ type: "varchar", length: 100 })
  batch_id: string;

  @Column({ type: "numeric", precision: 10, scale: 2, default: 0 })
  amount: string;

  @Column({ type: "varchar", length: 30, default: "pending" })
  status: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  modified_at: Date;
}
