import { User } from "src/entity/user.entity";
import { EntityRepository, Repository } from "typeorm";

export class UserRepository extends Repository<User> {

}