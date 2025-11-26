import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewType } from 'src/entity/review_type.entity';
import { CreateReviewTypeDto } from './create-review-type.dto';
import { UpdateReviewTypeDto } from './update-review-type.dto';

@Injectable()
export class ReviewTypeService {
  constructor(
    @InjectRepository(ReviewType)
    private readonly repo: Repository<ReviewType>,
  ) {}

  async createReviewType(userId: string, dto: CreateReviewTypeDto) {
    if (!dto.title?.trim()) {
      throw new BadRequestException('Title is required');
    }
    
    const reviewType = this.repo.create({
      title: dto.title.trim(),
      image_url: dto.image_url ?? null,
      active: dto.active ?? true,
      created_by: userId,
      modified_by: userId,
    });

    return await this.repo.save(reviewType);
  }

  async updateReviewType(id: string, userId: string, dto: UpdateReviewTypeDto) {
    const reviewType = await this.repo.findOne({ where: { id } });
    if (!reviewType) {
      throw new NotFoundException('Review Type not found');
    }

    if (dto.title !== undefined) {
      const newTitle = dto.title.trim();
      if (!newTitle) {
        throw new BadRequestException('Title cannot be empty');
      }
      reviewType.title = newTitle;
    }

    if (dto.image_url !== undefined) reviewType.image_url = dto.image_url;
    if (dto.active !== undefined) reviewType.active = dto.active;

    reviewType.modified_by = userId;
    reviewType.modified_at = new Date();

    return await this.repo.save(reviewType);
  }

  async deleteReviewType(id: string, userId: string) {
    const reviewType = await this.repo.findOne({ where: { id } });
    if (!reviewType) {
      throw new NotFoundException('Review Type not found');
    }
    await this.repo.delete(id);
    return { status: 'ok', deleted_by: userId };
  }

  async listPaginated(
    page = 1,
    limit = 10,
    search?: string,
    active?: boolean,
  ) {
    const qb = this.repo.createQueryBuilder('rt');

    qb.take(limit)
      .skip((page - 1) * limit)
      .orderBy('rt.created_at', 'DESC');

    if (search) {
      qb.andWhere('LOWER(rt.title) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    if (active !== undefined) {
      qb.andWhere('rt.active = :active', { active });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      status: 'ok',
      page,
      limit,
      total,
      data,
    };
  }

  async getReviewTypeProfile(id: string) {
    const reviewType = await this.repo.findOne({ where: { id } });
    if (!reviewType) {
      throw new NotFoundException('Review Type not found');
    }
    return {
      status: 'ok',
      data: reviewType,
    };
  }
}
