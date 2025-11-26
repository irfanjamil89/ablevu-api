import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessibleFeature } from 'src/entity/accessible feature.entity';
import { AccessibleFeatureDto } from './accessible feature.dto';
import { AccessibleFeatureLinkedType } from 'src/entity/accessible_feature_linked_type.entity';
import { AccessibleFeatureBusinessType } from 'src/entity/accessible_feature_business_type.entity';

@Injectable()
export class AccessibleFeatureService {
  constructor(
    @InjectRepository(AccessibleFeature)
    private accessibleFeatureRepo: Repository<AccessibleFeature>,

    @InjectRepository(AccessibleFeatureLinkedType)
    private linkedrepo: Repository<AccessibleFeatureLinkedType>,

    @InjectRepository(AccessibleFeatureBusinessType)
    private accessiblefeaturebusinesstyperepo: Repository<AccessibleFeatureBusinessType>

  ) { }

  private makeSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  async createAccessibleFeature(userId: string, dto: AccessibleFeatureDto) {
    if (dto.title.trim() === '') {
      throw new BadRequestException('Accessible Feature title is missing');
    }
    const slug = this.makeSlug(dto.title);

    const accessibleFeature = this.accessibleFeatureRepo.create({
      title: dto.title,
      slug,
      created_by: userId,
      modified_by: userId,
    });
    const savedFeature = await this.accessibleFeatureRepo.save(accessibleFeature);

    if (dto.accessible_feature_types && dto.accessible_feature_types.length > 0) {
      const linkedEntries = dto.accessible_feature_types.map((typeId) =>
        this.linkedrepo.create({
          accessible_feature_id: savedFeature.id,
          accessible_feature_type_id: typeId,
          active: dto.active,
          created_by: userId,
          modified_by: userId,
        }),
      );
      await this.linkedrepo.save(linkedEntries);
    }

    if (dto.business_type && dto.business_type.length > 0) {
      const linkedbusinesstype = dto.business_type.map((typeId) =>
        this.accessiblefeaturebusinesstyperepo.create({
          accessible_feature_id: savedFeature.id,
          business_type_id: typeId,
          active: dto.active,
          created_by: userId,
          modified_by: userId,
        }),
      );
      await this.accessiblefeaturebusinesstyperepo.save(linkedbusinesstype);
    }
  }
  async updateAccessibleFeature(id: string, userId: string, dto: AccessibleFeatureDto) {
    const accessibleFeature = await this.accessibleFeatureRepo.findOne({ where: { id } });
    if (!accessibleFeature) {
      throw new NotFoundException('Accessible Feature not found');
    }
    if (dto.title.trim() !== '') {
      accessibleFeature.title = dto.title;
      accessibleFeature.slug = this.makeSlug(dto.title);
    }
    accessibleFeature.modified_by = userId;
    await this.accessibleFeatureRepo.save(accessibleFeature);

    if (dto.accessible_feature_types && dto.accessible_feature_types.length > 0) {
      await this.linkedrepo.delete({ accessible_feature_id: id });
      const linkedEntries = dto.accessible_feature_types.map((typeId) =>
        this.linkedrepo.create({
          accessible_feature_id: id,
          accessible_feature_type_id: typeId,
          active: dto.active,
          created_by: userId,
          modified_by: userId,
        }),
      );
      await this.linkedrepo.save(linkedEntries)
    }
  }

  async deleteAccessibleFeature(id: string, userId: string) {
    const accessibleFeature = await this.accessibleFeatureRepo.findOne({ where: { id } });
    if (!accessibleFeature) {
      throw new NotFoundException('Accessible Feature not found');
    }
    accessibleFeature.modified_by = userId;
    await this.linkedrepo.delete({ accessible_feature_id: id });
    await this.accessibleFeatureRepo.remove(accessibleFeature);
  }

  async getAccessibleFeature(id: string) {
    const accessibleFeature = await this.accessibleFeatureRepo.findOne({ where: { id } });
    if (!accessibleFeature) {
      throw new NotFoundException('Accessible Feature not found');
    }
    const linkedTypes = await this.linkedrepo.find({
      where: { accessible_feature_id: id },
    });

    return {accessibleFeature,
      linkedTypes,
    };
  }

  async getPaginatedList(page = 1,
    limit = 10,
    opts?: { search?: string; },
  ) {
    const qb = this.accessibleFeatureRepo.createQueryBuilder('af').where('1=1');
    if (opts?.search) {
      qb.andWhere('af.title ILIKE :search', { search: `%${opts.search}%` });
    }

    const total = await qb.getCount();
    const items = await qb
      .orderBy('af.title', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

       const itemsWithLinkedTypes = await Promise.all(
    items.map(async (feature) => {
      const linkedTypes = await this.linkedrepo.find({
        where: { accessible_feature_id: feature.id },
      });
      const linkedBusinessTypes = await this.accessiblefeaturebusinesstyperepo.find({
        where: { accessible_feature_id: feature.id },
      });
      return { ...feature, linkedTypes, linkedBusinessTypes };
    })
  );

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: itemsWithLinkedTypes,
    };
  }
}