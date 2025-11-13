import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('business_resources')
export class AdditionalResource {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    business_id: string;

    @Column()
    label: string;

    @Column()
    link: string;

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