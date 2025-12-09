import { Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Subscribe {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  email: string;

  @Column()
  active: boolean;

  @Column()
  created_at: Date;

  @Column()
  modified_at: Date;
}
