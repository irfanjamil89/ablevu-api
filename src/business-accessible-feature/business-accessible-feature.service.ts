// business-accessible-feature.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessAccessibleFeature } from 'src/entity/business_accessiblity_feature.entity';
import { CreateBusinessAccessibleFeatureDto } from './create-business-accessible-feature.dto';
import { UpdateBusinessAccessibleFeatureDto } from './update-business-accessible-feature.dto';

@Injectable()
export class BusinessAccessibleFeatureService {
  constructor(
    @InjectRepository(BusinessAccessibleFeature)
    private readonly repo: Repository<BusinessAccessibleFeature>,
  ) {}

  // userId token se ayega (jaise baqi services me)
  async create(userId: string, dto: CreateBusinessAccessibleFeatureDto) {
    const { business_id, accessible_feature_ids, optional_answer } = dto;

    const rows = accessible_feature_ids.map((featureId) =>
      this.repo.create({
        business_id,
        accessible_feature_id: featureId,
        optional_answer: optional_answer || null,
        active: true,
        created_by: userId,
        modified_by: userId,
      }),
    );

    await this.repo.save(rows);

    return {
      message: 'Accessibility features added successfully',
    };
  }

  async update(
  id: string,
  userId: string,
  dto: UpdateBusinessAccessibleFeatureDto,
) {
  const row = await this.repo.findOne({ where: { id } });
  if (!row) {
    throw new NotFoundException('Business accessible feature not found');
  }
  Object.assign(row, dto, {
    modified_by: userId,
  });

  await this.repo.save(row);

  if (dto.accessible_feature_id && dto.accessible_feature_id.length > 0) {
    await this.repo.delete({ business_id: row.business_id });

    const featureEntries = dto.accessible_feature_id.map((featureId) =>
      this.repo.create({
        business_id: row.business_id,
        accessible_feature_id: featureId,
        optional_answer: dto.optional_answer || null,
        active: true,
        created_by: userId,
        modified_by: userId,
      }),
    );

    await this.repo.save(featureEntries);
  }

  return row;
}


  async delete(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException('Business accessible feature not found');
    }

    await this.repo.remove(row);
    return { message: 'Accessibility feature removed successfully' };
  }

  async list(businessId: string) {
    return this.repo.find({
      where: { business_id: businessId, active: true },
      order: { created_at: 'DESC' },
    });
  }
}
