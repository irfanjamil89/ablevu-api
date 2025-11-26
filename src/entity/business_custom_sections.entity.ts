import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class BusinessCustomSections{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    business_id: string;

    @Column()
    label: string;

    @Column()
    active: boolean;

    @Column()
    created_by: string;
    
    @Column()
    modified_by: string;
    
    @CreateDateColumn()
    created_at: Date;
    
    @UpdateDateColumn()
    modified_at: Date;


}