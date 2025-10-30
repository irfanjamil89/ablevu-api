import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from "src/entity/business.entity";
import { User } from "src/entity/user.entity";
import { CreateBusinessDto } from "./create-business.dto";
import { UpdateBusinessDto } from "./update-business.dto";

@Injectable()
export class BusinessService {
    constructor(
    @InjectRepository(Business) private readonly repo: Repository<Business>,
    @InjectRepository(User) private readonly users: Repository<User>,
    ) {}

    async createBusiness(dto: CreateBusinessDto, ownerId: string) {
        const owner = await this.users.findOneBy({ id: ownerId });
        const business = this.repo.create({ dto, owner });
        return this.repo.save(business);
    }
    async updateBusiness(id: string, dto: UpdateBusinessDto, ownerId: string){
        const business = await this.repo.findOne({ where: { id }, relations: { owner: true } });
        if (!business || business.owner.id !== ownerId) throw new NotFoundException('Business not found');
        Object.assign(business, dto);
        return this.repo.save(business);
    }
    async findMine(ownerId: string) {
    return this.repo.find({ where: { owner: { id: ownerId } } });
  }

  async findOne(id: string) {
  const business = await this.repo.findOne({
    where: { id },
  });
  if (!business) {
    throw new NotFoundException(`Business with ID ${id} not found`);
  }
  return business;
}


}
