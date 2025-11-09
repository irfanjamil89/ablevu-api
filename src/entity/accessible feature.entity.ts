import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class AccessibleFeature {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    slug: string;

    @Column()
    created_by: string;

    @Column()
    modified_by: string;

    @Column()
    created_at: Date;

    @Column()
    modified_at: Date;
}