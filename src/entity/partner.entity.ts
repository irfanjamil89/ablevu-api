import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Partner {
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
    web_url: string;

    @Column()
    active: boolean;

    @Column()
    created_by: string;

    @Column()
    modified_by: string;

    @Column()
    created_at: Date;

    @Column()
    modified_at: Date;
}