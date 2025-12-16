// business-accessible-feature.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BusinessAccessibleFeature } from 'src/entity/business_accessiblity_feature.entity';
import { CreateBusinessAccessibleFeatureDto } from './create-business-accessible-feature.dto';
import { UpdateBusinessAccessibleFeatureDto } from './update-business-accessible-feature.dto';

@Injectable()
export class BusinessAccessibleFeatureService {
  constructor(
    @InjectRepository(BusinessAccessibleFeature)
    private readonly repo: Repository<BusinessAccessibleFeature>,
  ) {}

  async create(userId: string, dto: CreateBusinessAccessibleFeatureDto) {
  const { business_id, accessible_feature_ids, optional_answer } = dto;

  // 🔹 same ID bar-bar aa jaye to bhi handle ho jaye
  const uniqueFeatureIds = Array.from(new Set(accessible_feature_ids));

  // 🔹 check karo ke in IDs me se koi pehle se is business ke sath added to nahi
  const alreadyExisting = await this.repo.find({
    where: {
      business_id: business_id,
      accessible_feature_id: In(uniqueFeatureIds),
    },
  });

  if (alreadyExisting.length > 0) {
    // agar even 1 bhi mila to error throw karo
    throw new BadRequestException(
      'This accessibility feature is already added',
    );
  }

  // 🔹 sirf NEW rows create karo
  const rows = uniqueFeatureIds.map((featureId) =>
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
