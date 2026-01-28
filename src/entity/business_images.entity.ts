import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class BusinessImages{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    tags: string;

    @Column()
    image_url: string;

    @Column()
    business_id: string;

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

    @Column()
    external_id: string;

}