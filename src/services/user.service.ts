import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UUID } from "crypto";
import { first } from "rxjs";
import { User } from "src/entity/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: UUID): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByUserName(username: string): Promise<User | null> {
  return this.usersRepository.findOne({ where: { email: username } });
}

  async save(): Promise<void> {
    const user = {
      id: 'dc2be30c-e446-4b63-b48f-9622a80f3e1c',
      firstName: 'sds',
      lastName: 'sdsd'
    };
    await this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}