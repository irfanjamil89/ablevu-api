import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from 'src/entity/feedback.entity';
import { FeedbackType } from 'src/entity/feedback-type.entity';
import { CreateFeedbackDto } from './create-feedback.dto';
import { UpdateFeedbackDto } from './update-feedback.dto';

type FeedbackListFilters = {
  businessId?: string;
  feedbackTypeId?: string;
  active?: boolean;
  search?: string;
};

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
    
    @InjectRepository(FeedbackType)
    private readonly feedbackTypeRepo: Repository<FeedbackType>,
  ) {}

  async createFeedback(userId: string, dto: CreateFeedbackDto) {
    if (!dto.feedback_type_id) {
      throw new BadRequestException('feedback_type_id is required');
    }
    
    const feedbackType = await this.feedbackTypeRepo.findOne({
      where: { id: dto.feedback_type_id },
    });
    if (!feedbackType) {
      throw new NotFoundException('Feedback Type not found');
    }
    const feedback = this.feedbackRepo.create({
      business_id: dto.business_id,
      feedback_type_id: dto.feedback_type_id ?? undefined,
      comment: dto.comment ?? undefined,
      active: dto.active ?? true,
      created_by: userId,
      modified_by: userId,
    });

    return this.feedbackRepo.save(feedback);
  }

  
  async updateFeedback(id: string, userId: string, dto: UpdateFeedbackDto) {
    const feedback = await this.feedbackRepo.findOne({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');

    if (dto.feedback_type_id) {
      const feedbackType = await this.feedbackTypeRepo.findOne({ where: { id: dto.feedback_type_id } });
      if (!feedbackType) throw new NotFoundException('Feedback Type not found');
    }

    Object.assign(feedback, {
      businessId: dto.business_id ?? feedback.business_id,
      feedback_type_id: dto.feedback_type_id ?? feedback.feedback_type_id,
      comment: dto.comment ?? feedback.comment,
      active: dto.active ?? feedback.active,
      modifiedBy: userId,
    });

    return this.feedbackRepo.save(feedback);
  }

  async deleteFeedback(id: string, userId: string) {
    const feedback = await this.feedbackRepo.findOne({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');
    await this.feedbackRepo.delete(id);
    return { status: 'ok', deleted_by: userId };
  }

  async listPaginated(
    page = 1,
    limit = 10,
    filters: FeedbackListFilters = {},
  ) {
    const qb = this.feedbackRepo
      .createQueryBuilder('f')
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('f.created_at', 'DESC');

    if (filters.businessId) {
      qb.andWhere('f.business_id = :businessId', { businessId: filters.businessId });
    }
    if (filters.feedbackTypeId) {
      qb.andWhere('f.feedback_type_id = :feedbackTypeId', { feedbackTypeId: filters.feedbackTypeId });
    }
    if (filters.active !== undefined) {
      qb.andWhere('f.active = :active', { active: filters.active });
    }
    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      qb.andWhere('LOWER(f.comment) LIKE :searchTerm', { searchTerm });
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

  async getFeedbackProfile(id: string) {
    const feedback = await this.feedbackRepo.findOne({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');
    return feedback;
  }
}
