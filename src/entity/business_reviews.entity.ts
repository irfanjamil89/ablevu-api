import { IsUUID } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class BusinessReviews{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @IsUUID()
    business_id:string;

    @Column()
    @IsUUID()
    review_type_id: string;

    @Column()
    description: string;

    @Column({ type: 'boolean', default: true })
    approved: boolean;

    @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
    approvedAt?: Date | null;


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

     @Column()
    image_url: string;
    
}