import { Injectable, NotFoundException, ForbiddenException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessRecomendations } from 'src/entity/business_recomendations.entity';
import { Business } from 'src/entity/business.entity';
import { CreateRecomendationsDto } from './create-business-recomendations.dto';
import { UpdateRecomendationsDto } from './update-business-recomendations.dto';

type ListRecomendationsFilters = {
  businessId?: string;
  active?: boolean;
};
@Injectable()
export class BusinessRecomendationsService {
  constructor(
    @InjectRepository(BusinessRecomendations)
    private readonly recomendationsRepo: Repository<BusinessRecomendations>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
  ) {}

  async createBusinessRecomendations(userId: string, dto: CreateRecomendationsDto) {
    const business = await this.businessRepo.findOne({
      where: {
        id: dto.businessId,
        owner: { id: userId },
      },
      relations: { owner: true },
    });
    if (!business) {
      throw new ForbiddenException('You cannot modify this business');
    }
    const recomendations = this.recomendationsRepo.create({
      business,
      label: dto.label,
      active: dto.active ?? true,
      created_by: userId,
      modified_by: userId,
    })
    return this.recomendationsRepo.save(recomendations);
  }

  async updateBusinessRecomendations(
    id: string,
    userId: string,
    dto: UpdateRecomendationsDto,
  ) {
    const recomendations = await this.recomendationsRepo.findOne({
      where: { id },
    });
    if (!recomendations) {
      throw new NotFoundException('Business Recomendations not found');
    }

    Object.assign(recomendations, {
            businessId: dto.businessId ?? recomendations.business,
            label: dto.label ?? recomendations.label,
            active: dto.active ?? recomendations.active,
            modifiedBy: userId,
          });

    return this.recomendationsRepo.save(recomendations);
  }
  
  async deleteBusinessRecomendations(userId: string, id: string) {
    const recomendations = await this.recomendationsRepo.findOne({
      where: { id },
    });
    if (!recomendations) {
      throw new NotFoundException('Business Recomendations not found');
    }

    await this.recomendationsRepo.remove(recomendations);
    return { deleted: true };
  }

  async listPaginated(
    page = 1,
    limit = 10,
    filters: ListRecomendationsFilters,
  ) {
    const qb = this.recomendationsRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.business', 'b');

    if (filters.businessId) {
      qb.andWhere('b.id = :businessId', { businessId: filters.businessId });
    }
    if (filters.active !== undefined) {
      qb.andWhere('r.active = :active', { active: filters.active });
    }
    qb
      .orderBy('r.active', 'ASC')
      .take(limit)
      .skip((page - 1) * limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBusinessRecomendationsProfile(id: string) {
     const recomendations = await this.recomendationsRepo.findOne({
      where: { id },
    });
    if (!recomendations) {
      throw new NotFoundException('Business Recomendations not found');
    }
    return recomendations;
  }
}
