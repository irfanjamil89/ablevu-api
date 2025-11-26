import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateBusinessCustomSectionsDto } from "./create-business-custom-section.dto";
import { UpdateBusinessCustomSectionsDto } from "./update-business-custom-sections.dto";
import { Repository } from "typeorm";
import { Business } from "src/entity/business.entity";
import { BusinessCustomSections } from "src/entity/business_custom_sections.entity";

@Injectable()
export class BusinessCustomSectionsService{
    constructor(
    @InjectRepository(BusinessCustomSections)
    private readonly customSectionrepo: Repository<BusinessCustomSections>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>

    ){}

    async createBusinessCustomSection(userId: string, dto: CreateBusinessCustomSectionsDto) {
         if (!dto.business_id) {
          throw new BadRequestException('business_id is required');
        }
        const business = await this.businessRepo.findOne({
          where: { id: dto.business_id },
        });
        if (!business) {
          throw new NotFoundException('Business not found');
        }
        
        const customSection = this.customSectionrepo.create({
          business_id: dto.business_id,
          label: dto.label,
          active: dto.active,
          created_by: userId,
          modified_by: userId,
        });
    
        return this.customSectionrepo.save(customSection);
      }

    async updateBusinessCustomSection(id: string, userId: string, dto: UpdateBusinessCustomSectionsDto) {
        const customSection = await this.customSectionrepo.findOne({ where: { id } });
         if (!customSection) throw new NotFoundException('Business Custom Section not found');
      
         if (dto.business_id) {
        const business = await this.businessRepo.findOne({ where: { id: dto.business_id } });
         if (!business) throw new NotFoundException('Business not found');
          }
        
        Object.assign(customSection, {
            businessId: dto.business_id ?? customSection.business_id,
            label: dto.label ?? customSection.label,
            active: dto.active ?? customSection.active,
            modifiedBy: userId,
          });
      
        return this.customSectionrepo.save(customSection);
        }

    async deleteBusinessCustomSection(id: string, userId: string) {
        const customSection = await this.customSectionrepo.findOne({ where: { id } });
         if (!customSection) throw new NotFoundException('Business Custom Section not found');

        customSection.modified_by = userId;
        return this.customSectionrepo.remove(customSection);
        }

    async listpaginated(
    page = 1,
    limit = 10,
    filters: { businessId?: string; active?: boolean | undefined },
  ) {
    const qb = this.customSectionrepo
      .createQueryBuilder('cs')
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('cs.created_at', 'DESC');

    if (filters.businessId) {
      qb.andWhere('r.business_id = :businessId', { businessId: filters.businessId });
    }
     if (filters.active !== undefined) {
    qb.andWhere('cs.active = :active', { active: filters.active });
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

  async getBusinessCustomSectionProfile(id: string) {
    const customSection = await this.customSectionrepo.findOne({ where: { id } });
    if (!customSection) throw new NotFoundException('Business Custom Section not found');
    return customSection;
  }

}