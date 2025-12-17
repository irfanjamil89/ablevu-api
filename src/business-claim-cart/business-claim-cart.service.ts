import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BusinessClaimCart } from "src/entity/business_claim_cart.entity";
import { CreateBusinessClaimCartDto } from "./create-business-claim-cart.dto";
import { UpdateBusinessClaimCartDto } from "./update-business-claim-cart.dto";

@Injectable()
export class BusinessClaimCartService {
  constructor(
    @InjectRepository(BusinessClaimCart)
    private readonly repo: Repository<BusinessClaimCart>,
  ) {}

  private makeBatchId() {
    // simple batch id
    return `batch_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  async create(userId: string, dto: CreateBusinessClaimCartDto) {
    if (!dto.business_id) {
      throw new BadRequestException("business_id is required");
    }

    // ✅ prevent duplicate cart item for same user + same business (pending)
    const exists = await this.repo.findOne({
      where: {
        user_id: userId,
        business_id: dto.business_id,
        status: "pending",
      },
    });

    if (exists) {
      return {
        message: "Already in cart",
        data: exists,
      };
    }

    const row = this.repo.create({
      business_id: dto.business_id,
      user_id: userId,
      batch_id: dto.batch_id?.trim() || this.makeBatchId(),
      amount: dto.amount ?? 0,
      status: dto.status ?? "pending",
    });

    const saved = await this.repo.save(row);
    return { message: "Added to cart", data: saved };
  }

  async findAll() {
    return await this.repo.find({
      order: { created_at: "DESC" as any },
    });
  }

  async findByUser(userId: string) {
    return await this.repo.find({
      where: { user_id: userId },
      order: { created_at: "DESC" as any },
    });
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException("Cart item not found");
    return row;
  }

  async update(id: string, userId: string, dto: UpdateBusinessClaimCartDto) {
    const row = await this.repo.findOne({ where: { id, user_id: userId } });
    if (!row) throw new NotFoundException("Cart item not found");

    // ✅ optional: don't allow business_id change
    if ((dto as any).business_id && (dto as any).business_id !== row.business_id) {
      throw new BadRequestException("business_id cannot be changed");
    }

    Object.assign(row, dto);
    return await this.repo.save(row);
  }

  async delete(id: string, userId: string) {
    const row = await this.repo.findOne({ where: { id, user_id: userId } });
    if (!row) throw new NotFoundException("Cart item not found");

    await this.repo.remove(row);
    return { message: "Deleted", id };
  }

  async clearByBatch(userId: string, batchId: string) {
    if (!batchId) throw new BadRequestException("batchId is required");
    await this.repo.delete({ user_id: userId, batch_id: batchId });
    return { message: "Batch cleared", batch_id: batchId };
  }
}
