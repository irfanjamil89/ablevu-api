import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class BusinessQuestions{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    business_id: string;

    @Column()
    answer: string;

    @Column()
    question: string;

    @Column({ type: 'boolean', default: true })
    active: boolean;

    @Column()
    show_name: boolean;

    @Column()
    created_by: string;

    @Column()
    modified_by: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    modified_at: Date;

    @Column()
    external_id: string;

}