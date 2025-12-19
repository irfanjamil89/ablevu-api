import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('business_custom_section_media')
export class BusinessCustomSectionsMedia{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    business_id: string;

    @Column()
    business_custom_section_id: string;

    @Column()
    label: string;

    @Column()
    link: string;

    @Column()
    description:string;

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