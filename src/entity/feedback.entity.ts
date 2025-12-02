import { IsUUID } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Feedback{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @IsUUID()
    business_id:string;

    @Column()
    @IsUUID()
    feedback_type_id: string;

    @Column()
    comment: string;

    @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
    approved_at: Date | null;

    @Column({ type: 'boolean', default: true })
    active: boolean;

    @Column()
    created_by:string;

    @Column()
    modified_by:string;

    @CreateDateColumn()
    created_at:Date;

    @UpdateDateColumn()
    modified_at: Date;

}