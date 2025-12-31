// src/entity/business_draft.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index
} from "typeorm";

export type DraftStatus = "pending" | "completed" | "cancelled" | "expired" | "failed";

@Entity("business_drafts")
export class BusinessDraft {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "uuid" })
  user_id: string;

  @Column({ type: "varchar", default: "pending" })
  status: DraftStatus;

  // business payload
  @Column({ type: "jsonb" })
  payload: any;

  // optional image
  @Column({ type: "text", nullable: true })
  image_base64: string | null;

  @Index()
  @Column({ type: "varchar", nullable: true })
  stripe_session_id: string | null;

  @Index()
  @Column({ type: "varchar", nullable: true })
  stripe_subscription_id: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;
}
