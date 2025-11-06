import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessibleFeature } from 'src/entity/accessible feature.entity';

@Injectable()
export class AccessibleFeatureService {
  constructor(
    @InjectRepository(AccessibleFeature)
    private accessibleFeatureRepo: Repository<AccessibleFeature>,
  ) { }

  private makeSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  async createAccessibleFeature(userId: string, title: string) {
    if (!title || title.trim() === '') {
      throw new BadRequestException('Accessible Feature title is missing');
    }
    const slug = this.makeSlug(title);

    const accessibleFeature = this.accessibleFeatureRepo.create({
      title,
      slug,
      created_by: userId,
      modified_by: userId,
    });
    await this.accessibleFeatureRepo.save(accessibleFeature);
  }

  async updateAccessibleFeature(id: string, userId: string, title: string) {
    const accessibleFeature = await this.accessibleFeatureRepo.findOne({ where: { id } });
    if (!accessibleFeature) {
      throw new NotFoundException('Accessible Feature not found');
    }
    if (title && title.trim() !== '') {
      accessibleFeature.title = title;
      accessibleFeature.slug = this.makeSlug(title);
    }
    accessibleFeature.modified_by = userId;
    await this.accessibleFeatureRepo.save(accessibleFeature);
  }

  async deleteAccessibleFeature(id: string, userId: string) {
    const accessibleFeature = await this.accessibleFeatureRepo.findOne({ where: { id } });
    if (!accessibleFeature) {
      throw new NotFoundException('Accessible Feature not found');
    }
    accessibleFeature.modified_by = userId;
    await this.accessibleFeatureRepo.remove(accessibleFeature);
  }

  async getAccessibleFeature(id: string) {
    const accessibleFeature = await this.accessibleFeatureRepo.findOne({ where: { id } });
    if (!accessibleFeature) {
      throw new NotFoundException('Accessible Feature not found');
    }
    return accessibleFeature;
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

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }
    }