import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedbackType } from 'src/entity/feedback-type.entity';
import { CreateFeedbackTypeDto } from './create-feedback-type.dto';
import { UpdateFeedbackTypeDto } from './update-feedback-type.dto';

@Injectable()
export class FeedbackTypeService {
  constructor(
    @InjectRepository(FeedbackType)
    private readonly repo: Repository<FeedbackType>,
  ) {}

  async createFeedbackType(userId: string, dto: CreateFeedbackTypeDto) {
    if (!dto.name?.trim()) {
      throw new BadRequestException('Name is required');
    }
    
    const feedbackType = this.repo.create({
      name: dto.name.trim(),
      image_url: dto.image_url ?? null,
      active: dto.active ?? true,
      created_by: userId,
      modified_by: userId,
    });

    return await this.repo.save(feedbackType);
  }

  async updateFeedbackType(id: string, userId: string, dto: UpdateFeedbackTypeDto) {
    const feedbackType = await this.repo.findOne({ where: { id } });
    if (!feedbackType) {
      throw new NotFoundException('Feedback Type not found');
    }

    if (dto.name !== undefined) {
      const newName = dto.name.trim();
      if (!newName) {
        throw new BadRequestException('Name cannot be empty');
      }
      feedbackType.name = newName;
    }

    if (dto.image_url !== undefined) feedbackType.image_url = dto.image_url;
    if (dto.active !== undefined) feedbackType.active = dto.active;

    feedbackType.modified_by = userId;
    feedbackType.modified_at = new Date();

    return await this.repo.save(feedbackType);
  }

  async deleteFeedbackType(id: string, userId: string) {
    const feedbackType = await this.repo.findOne({ where: { id } });
    if (!feedbackType) {
      throw new NotFoundException('Feedback Type not found');
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
    const qb = this.repo.createQueryBuilder('ft');

    qb.take(limit)
      .skip((page - 1) * limit)
      .orderBy('ft.created_at', 'DESC');

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

  async getFeedbackTypeProfile(id: string) {
    const feedbackType = await this.repo.findOne({ where: { id } });
    if (!feedbackType) {
      throw new NotFoundException('Feedback Type not found');
    }
    return {
      status: 'ok',
      data: feedbackType,
    };
  }
}
