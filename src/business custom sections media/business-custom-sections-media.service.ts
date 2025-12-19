import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BusinessCustomSectionsMedia } from "src/entity/business-custom-sections-media.entity";
import { BusinessCustomSectionsMediaDto } from "./business-custom-sections-media.dto";


@Injectable()
export class BusinessCustomSectionsMediaService {
    constructor(
        @InjectRepository(BusinessCustomSectionsMedia)
        private readonly customSectionMediaRepo: Repository<BusinessCustomSectionsMedia>,
    ) { }


    async createBusinessCustomSectionMedia(userId: string, dto: BusinessCustomSectionsMediaDto) {
        if (!dto.business_id) {
            throw new BadRequestException('business_id is required');
        }
        const customSectionMedia = this.customSectionMediaRepo.create({
            business_id: dto.business_id,
            business_custom_section_id: dto.business_custom_section_id,
            label: dto.label,
            link: dto.link,
            description: dto.description,
            active: dto.active,
            created_by: userId,
            modified_by: userId,
        });
        return this.customSectionMediaRepo.save(customSectionMedia);
    }

    async updateBusinessCustomSectionMedia(id: string, userId: string, dto: BusinessCustomSectionsMediaDto) {
        const customSectionMedia = await this.customSectionMediaRepo.findOne({ where: { id } });
        if (!customSectionMedia) throw new NotFoundException('Business Custom Section Media not found');
        Object.assign(customSectionMedia, {
            business_id: dto.business_id ?? customSectionMedia.business_id,
            business_custom_section_id: dto.business_custom_section_id ?? customSectionMedia.business_custom_section_id,
            label: dto.label ?? customSectionMedia.label,
            link: dto.link ?? customSectionMedia.link,
            description:dto.description ?? customSectionMedia.description,
            active: dto.active ?? customSectionMedia.active,
            modified_by: userId,
        });
        return this.customSectionMediaRepo.save(customSectionMedia);
    }

    async deleteBusinessCustomSectionMedia(id: string, userId: string) {
        const customSectionMedia = await this.customSectionMediaRepo.findOne({ where: { id } });
        if (!customSectionMedia) throw new NotFoundException('Business Custom Section Media not found');
        await this.customSectionMediaRepo.remove(customSectionMedia);
        return { message: 'Business Custom Section Media deleted successfully' };
    }


    async listpaginated(
        page = 1,
        limit = 10,
        filters: { businessId?: string; active?: boolean },
    ) {
        const qb = this.customSectionMediaRepo
            .createQueryBuilder('csm')
            .take(limit)
            .skip((page - 1) * limit)
            .orderBy('csm.created_at', 'DESC');

        if (filters.businessId) {
            qb.andWhere('csm.business_id = :businessId', {
                businessId: filters.businessId,
            });
        }

        if (filters.active !== undefined) {
            qb.andWhere('csm.active = :active', {
                active: filters.active,
            });
        }

        const [items, total] = await qb.getManyAndCount();

        return {
            data: items,
            meta: {
                total,
                page,
                limit,
                pageCount: Math.max(1, Math.ceil(total / limit)),
            },
        };
    }


}