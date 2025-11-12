import { IsBoolean, IsUrl } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class ReviewType{

    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    title: string;

    @Column()
    image_url: string;

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