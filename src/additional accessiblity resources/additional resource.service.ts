import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdditionalResource } from 'src/entity/additional_resource.entity';
import { AdditionalResourceDto } from './additional resource.dto';

@Injectable()
export class AdditionalResourceService {
    constructor(
        @InjectRepository(AdditionalResource)
        private additionalResourceRepo: Repository<AdditionalResource>,
    ) { }

    async createAdditionalResource(userId: string, dto: AdditionalResourceDto) {
        const additionalResource = this.additionalResourceRepo.create({
            business_id: dto.business_id,
            label: dto.label,
            link: dto.link,
            active: dto.active,
            created_by: userId,
            modified_by: userId,
        });
        await this.additionalResourceRepo.save(additionalResource);
    }

    async updateAdditionalResource(id: string, userId: string, dto: AdditionalResourceDto) {
        const additionalResource = await this.additionalResourceRepo.findOne({ where: { id } });
        if (!additionalResource) {
            throw new NotFoundException('Additional Resource not found');
        }
        additionalResource.label = dto.label;
        additionalResource.link = dto.link;
        additionalResource.active = dto.active;
        additionalResource.modified_by = userId;
        return await this.additionalResourceRepo.save(additionalResource);
    }

    async deleteAdditionalResource(id: string, userId: string) {
        const additionalResource = await this.additionalResourceRepo.findOne({ where: { id } });
        if (!additionalResource) {
            throw new NotFoundException('Additional Resource not found');
        }
        await this.additionalResourceRepo.remove(additionalResource);
    }

    async getAdditionalResource(id: string) {
        const additionalResource = await this.additionalResourceRepo.findOne({ where: { id } });
        if (!additionalResource) {
            throw new NotFoundException('Additional Resource not found');
        }
        return additionalResource;
    }

    async getPaginatedList(page = 1,
        limit = 10,
        opts?: { search?: string; active?: boolean }) {
        const qb = this.additionalResourceRepo
            .createQueryBuilder('ar')

        if (opts?.search) {
            qb.andWhere('ar.label ILIKE :search', { search: `%${opts.search}%` });
        }

        if (opts?.active !== undefined) {
            qb.andWhere('ar.active = :active', { active: opts.active });
        }

        const total = await qb.getCount();
        const data = await qb

            .orderBy('ar.created_at', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();

        return {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data,
        };
    }
}