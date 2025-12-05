import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateBusinessImages } from "./create-business-images.dto";
import { UpdateBusinessImages } from "./update-business-images.dto";
import { Repository } from "typeorm";
import { Business } from "src/entity/business.entity";
import { BusinessImages } from "src/entity/business_images.entity";

@Injectable()
export class BusinessImagesService{
    constructor(
    @InjectRepository(BusinessImages)
    private readonly imagesRepo: Repository<BusinessImages>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>
    ){}

    async createBusinessImages(userId: string, dto: CreateBusinessImages) {
         if (!dto.business_id) {
          throw new BadRequestException('business_id is required');
        }
        const business = await this.businessRepo.findOne({
          where: { id: dto.business_id },
        });
        if (!business) {
          throw new NotFoundException('Business not found');
        }
        const images = this.imagesRepo.create({
          name: dto.name,
          description: dto.description,
          tags: dto.tags,
          image_url: dto.image_url,
          business_id: dto.business_id,
          active: dto.active,
          created_by: userId,
          modified_by: userId,
        });
    
        return this.imagesRepo.save(images);
      }

    async updateBusinessImages(id: string, userId: string, dto: UpdateBusinessImages) {
        const images = await this.imagesRepo.findOne({ where: { id } });
         if (!images) throw new NotFoundException('Business Images not found');
      
         if (dto.business_id) {
        const business = await this.businessRepo.findOne({ where: { id: dto.business_id } });
         if (!business) throw new NotFoundException('Business not found');
          }
        
        Object.assign(images, {
            name: dto.name ?? images.name,
            description: dto.description ?? images.description,
            tags: dto.tags ?? images.tags,
            image_url: dto.image_url ?? images.image_url,
            businessId: dto.business_id ?? images.business_id,
            active: dto.active ?? images.active,
            modifiedBy: userId,
          });
      
        return this.imagesRepo.save(images);
        }

    async deleteBusinessImages(id: string, userId: string) {
        const images = await this.imagesRepo.findOne({ where: { id } });
         if (!images) throw new NotFoundException('Business Images not found');

        images.modified_by = userId;
        return this.imagesRepo.remove(images);
        }

    async listpaginated(
    page = 1,
    limit = 10,
    filters: { businessId?: string; active?: boolean | undefined },
  ) {
    const qb = this.imagesRepo
      .createQueryBuilder('i')
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('i.created_at', 'DESC');

    if (filters.businessId) {
      qb.andWhere('i.business_id = :businessId', { businessId: filters.businessId });
    }
     if (filters.active !== undefined) {
    qb.andWhere('i.active = :active', { active: filters.active });
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

  async getBusinessImagesProfile(id: string) {
    const images = await this.imagesRepo.findOne({ where: { id } });
    if (!images) throw new NotFoundException('Business Images not found');
    return images;
  }

}