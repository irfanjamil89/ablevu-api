import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { OneToMany } from 'typeorm';
import { BusinessAccessibleFeature } from "./business_accessiblity_feature.entity";

@Entity()
export class AccessibleFeature {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    external_id: string;

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

    @OneToMany(() => BusinessAccessibleFeature, (bf) => bf.accessible_feature)
    businessAccessibleFeatures: BusinessAccessibleFeature[];
}