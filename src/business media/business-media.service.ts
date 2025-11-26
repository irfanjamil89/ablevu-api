import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateBusinessMedia } from "./create-business-media.dto";
import { UpdateBusinessMedia } from "./update-business-media.dto";
import { Repository } from "typeorm";
import { Business } from "src/entity/business.entity";
import { BusinessMedia } from "src/entity/business_media.entity";

@Injectable()
export class BusinessMediaService{
    constructor(
    @InjectRepository(BusinessMedia)
    private readonly mediaRepo: Repository<BusinessMedia>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>
    ){}

    async createBusinessMedia(userId: string, dto: CreateBusinessMedia) {
         if (!dto.business_id) {
          throw new BadRequestException('business_id is required');
        }
        const business = await this.businessRepo.findOne({
          where: { id: dto.business_id },
        });
        if (!business) {
          throw new NotFoundException('Business not found');
        }
        
        const media = this.mediaRepo.create({
          business_id: dto.business_id,
          label: dto.label,
          link: dto.link,
          active: dto.active,
          created_by: userId,
          modified_by: userId,
        });
    
        return this.mediaRepo.save(media);
      }

    async updateBusinessMedia(id: string, userId: string, dto: UpdateBusinessMedia) {
        const media = await this.mediaRepo.findOne({ where: { id } });
         if (!media) throw new NotFoundException('Business Media not found');
      
         if (dto.business_id) {
        const business = await this.businessRepo.findOne({ where: { id: dto.business_id } });
         if (!business) throw new NotFoundException('Business not found');
          }
        
        Object.assign(media, {
            businessId: dto.business_id ?? media.business_id,
            label: dto.label ?? media.label,
            link: dto.link ?? media.link,
            active: dto.active ?? media.active,
            modifiedBy: userId,
          });
      
        return this.mediaRepo.save(media);
        }

    async deleteBusinessMedia(id: string, userId: string) {
        const media = await this.mediaRepo.findOne({ where: { id } });
         if (!media) throw new NotFoundException('Business Media not found');

        media.modified_by = userId;
        return this.mediaRepo.remove(media);
        }

    async listpaginated(
    page = 1,
    limit = 10,
    filters: { businessId?: string; active?: boolean | undefined },
  ) {
    const qb = this.mediaRepo
      .createQueryBuilder('m')
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('m.created_at', 'DESC');

    if (filters.businessId) {
      qb.andWhere('r.business_id = :businessId', { businessId: filters.businessId });
    }
     if (filters.active !== undefined) {
    qb.andWhere('m.active = :active', { active: filters.active });
    }
    const [items, total] = await qb.getManyAndCount();
    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getBusinessMediaProfile(id: string) {
    const media = await this.mediaRepo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Business Media not found');
    return media;
  }

}