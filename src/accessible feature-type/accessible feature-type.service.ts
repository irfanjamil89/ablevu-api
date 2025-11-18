import { Injectable, NotFoundException , BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessibleFeatureType } from 'src/entity/accessible feature-type.entity';
import { AccessibleFeatureTypeDto } from './accessible feature-type.dto';

@Injectable()
export class AccessibleFeatureTypeService {
    constructor(
        @InjectRepository(AccessibleFeatureType)
        private accessibleFeatureTypeRepo: Repository<AccessibleFeatureType>,
    ) {}

    private makeSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async createAccessibleFeatureType(dto: AccessibleFeatureTypeDto, userId: string) {
    if ( dto.name.trim() === '') {
    throw new BadRequestException('Accessible Feature Type name is missing');
    }
    const slug = this.makeSlug(dto.name);

    const AccessibleFeatureType= this.accessibleFeatureTypeRepo.create({
      name: dto.name,
      picture_url: dto.picture_url ?? null,
      display_order: dto.display_order ?? null,
      active: dto.active ?? true,
      slug,
      created_by: userId,
      modified_by: userId,
    });

      await this.accessibleFeatureTypeRepo.save(AccessibleFeatureType);
  }

  async updateAccessibleFeatureType( dto: AccessibleFeatureTypeDto ,id: string, userId: string) {
    const AccessibleFeatureType = await this.accessibleFeatureTypeRepo.findOne({ where: { id } });
    if (!AccessibleFeatureType) { 
      throw new NotFoundException('Accessible Feature Type not found');
    }   
    if ( dto.name.trim() !== '') {
      AccessibleFeatureType.name = dto.name;
      AccessibleFeatureType.slug = this.makeSlug(dto.name);
    }
    if (dto.picture_url !== undefined) AccessibleFeatureType.picture_url = dto.picture_url;
    if (dto.display_order !== undefined) AccessibleFeatureType.display_order = dto.display_order;
    if (dto.active !== undefined) AccessibleFeatureType.active = dto.active;
    AccessibleFeatureType.modified_by = userId;
    await this.accessibleFeatureTypeRepo.save(AccessibleFeatureType);
  }

   async deleteAccessibleFeatureType(id: string) {
    const AccessibleFeatureType = await this.accessibleFeatureTypeRepo.findOne({ where: { id } });
    if (!AccessibleFeatureType) { 
      throw new NotFoundException('Accessible Feature Type not found');
    }   
    await this.accessibleFeatureTypeRepo.remove(AccessibleFeatureType);
   }

    async getAccessibleFeatureType(id: string) {
     const AccessibleFeatureType = await this.accessibleFeatureTypeRepo.findOne({ where: { id } });  
    if (!AccessibleFeatureType) {
       throw new NotFoundException('Accessible Feature Type not found');
    }
    return AccessibleFeatureType;
  } 

  async getPaginatedList(page = 1,
     limit = 10,
     opts?: { search?: string; active?: boolean }) {
  const qb = this.accessibleFeatureTypeRepo
    .createQueryBuilder('aft')
    .where('1=1');

  if (opts?.search) {
    qb.andWhere('aft.name ILIKE :search', { search: `%${opts.search}%` });
  }

  if (opts?.active !== undefined) {
    qb.andWhere('aft.active = :active', { active: opts.active });
  }

  const total = await qb.getCount();
  const data = await qb
    .orderBy('aft.created_at', 'ASC')
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