import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Subscribe } from "src/entity/subscribe.entity";
import { CreateSubscribeDto } from "./create-subscribe.dto";

@Injectable()
export class SubscribeService {
  constructor(
    @InjectRepository(Subscribe)
    private readonly repo: Repository<Subscribe>,
  ) {}

  async create(dto: CreateSubscribeDto) {
  const existing = await this.repo.findOne({
    where: { email: dto.email },
  });

  if (existing) {
    return {
      success: false,
      message: "Email already subscribed",
    };
  }

  const subscribe = this.repo.create({
    email: dto.email,
    active: true,
    created_at: new Date(),
    modified_at: new Date(),
  });

  return await this.repo.save(subscribe);
}

  async delete(id: string) {
    const record = await this.repo.findOne({ where: { id } });
    if (!record) throw new NotFoundException("Subscriber not found");

    await this.repo.remove(record);
    return { message: "Subscriber deleted successfully" };
  }
}
