import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessReviews } from 'src/entity/business_reviews.entity';
import { CreateBusinessReviewsDto } from './create-business-reviews.dto';
import { UpdateBusinessReviewsDto } from './update-business-reviews.dto';
import { Business } from 'src/entity/business.entity';
import { ReviewType } from 'src/entity/review_type.entity';

type ReviewListFilters = {
  businessId?: string;
  reviewTypeId?: string;
  approved?: boolean;
  active?: boolean;
  search?: string;
};

@Injectable()
export class BusinessReviewsService {
  constructor(
    @InjectRepository(BusinessReviews)
    private readonly reviewRepo: Repository<BusinessReviews>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,

    @InjectRepository(ReviewType)
    private readonly reviewTypeRepo: Repository<ReviewType>,
  ) { }

  async createBusinessReviews(userId: string, dto: CreateBusinessReviewsDto) {
    if (!dto.business_id) {
      throw new BadRequestException('business_id is required');
    }
    if (!dto.review_type_id) {
      throw new BadRequestException('review_type_id is required');
    }

    const business = await this.businessRepo.findOne({
      where: { id: dto.business_id },
    });
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const reviewType = await this.reviewTypeRepo.findOne({
      where: { id: dto.review_type_id },
    });
    if (!reviewType) {
      throw new NotFoundException('Review Type not found');
    }

    const review = this.reviewRepo.create({
      business_id: dto.business_id,
      review_type_id: dto.review_type_id ?? undefined,
      description: dto.description ?? undefined,
      approved: false,
      active: dto.active ?? true,
      created_by: userId,
      modified_by: userId,
    });

    return this.reviewRepo.save(review);
  }


  async updateBusinessReviews(id: string, userId: string, dto: UpdateBusinessReviewsDto) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Business Review not found');

    if (dto.business_id) {
      const business = await this.businessRepo.findOne({ where: { id: dto.business_id } });
      if (!business) throw new NotFoundException('Business not found');
    }

    if (dto.review_type_id) {
      const reviewType = await this.reviewTypeRepo.findOne({ where: { id: dto.review_type_id } });
      if (!reviewType) throw new NotFoundException('Review Type not found');
    }

    let approvedAt = review.approvedAt;
    if (dto.approved === true && review.approved === false) {
      approvedAt = new Date();
    }

    Object.assign(review, {
      business_id: dto.business_id ?? review.business_id,
      review_type_id: dto.review_type_id ?? review.review_type_id,
      description: dto.description ?? review.description,
      approved: dto.approved ?? review.approved,
      approvedAt,
      active: dto.active ?? review.active,
      modified_by: userId,
    });

    return this.reviewRepo.save(review);
  }


  async deleteBusinessReviews(id: string, userId: string) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Business Review not found');

    review.active = false;
    review.modified_by = userId;
    return this.reviewRepo.remove(review);
  }


  async listPaginated(
    page = 1,
    limit = 10,
    filters: ReviewListFilters = {},
  ) {
    const qb = this.reviewRepo
      .createQueryBuilder('r')
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('r.created_at', 'DESC');

    if (filters.businessId) {
      qb.andWhere('r.business_id = :businessId', { businessId: filters.businessId });
    }
    if (filters.reviewTypeId) {
      qb.andWhere('r.review_type_id = :reviewTypeId', { reviewTypeId: filters.reviewTypeId });
    }
    if (filters.approved !== undefined) {
      qb.andWhere('r.approved = :approved', { approved: filters.approved });
    }
    if (filters.active !== undefined) {
      qb.andWhere('r.active = :active', { active: filters.active });
    }
    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      qb.andWhere('LOWER(r.description) LIKE :searchTerm', { searchTerm });
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

  async getBusinessReviewProfile(id: string) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Business Review not found');
    return review;
  }
}
