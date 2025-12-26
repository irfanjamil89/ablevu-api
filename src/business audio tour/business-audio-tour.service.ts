import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessAudioTour } from '../entity/business_audio_tour.entity';
import { Business } from 'src/entity/business.entity';
import { CreateBusinessAudioTour } from './create-business-audio-tour.dto';
import { UpdateBusinessAudioTour } from './update-business-audio-tour.dto';

type ListFilters = {
  businessId?: string;
  active?: boolean;
  search?: string;
};

@Injectable()
export class BusinessAudioTourService {
  constructor(
    @InjectRepository(BusinessAudioTour)
    private readonly repo: Repository<BusinessAudioTour>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
  ) {}

  async createBusinessAudioTour(userId: string, dto: CreateBusinessAudioTour) {
    // Validate required fields first
    if (!dto.name?.trim()) {
      throw new BadRequestException('The field "name" is required and cannot be empty.');
    }

  

    if (!dto.businessId?.trim()) {
      throw new BadRequestException('The field "businessId" is required and cannot be empty.');
    }

    // Check if business exists
    const business = await this.businessRepo.findOne({
      where: { id: dto.businessId },
    });

    if (!business) {
      throw new NotFoundException(
        `No business found against businessId: ${dto.businessId}`,
      );
    }

    // Create tour
    const tour = this.repo.create({
      name: dto.name,
      link_url: dto.linkUrl,
      business_id: dto.businessId,
      active: dto.active ?? true,
      created_by: userId,
      modified_by: userId,
    });

    return await this.repo.save(tour); // ← Added await
  }

  async updateBusinessAudioTour(
    id: string,
    userId: string,
    dto: UpdateBusinessAudioTour,
  ) {
    const tour = await this.repo.findOne({ where: { id } });
    if (!tour) {
      throw new NotFoundException('Business Audio Tour not found');
    }

    // Update fields - need to map DTO camelCase to entity snake_case
    if (dto.name !== undefined) tour.name = dto.name;
    if (dto.linkUrl !== undefined) tour.link_url = dto.linkUrl;
    if (dto.active !== undefined) tour.active = dto.active;
    
    tour.modified_by = userId;

    return await this.repo.save(tour);
  }

  async deleteBusinessAudioTour(userId: string, id: string) {
    const tour = await this.repo.findOne({ where: { id } });
    if (!tour) {
      throw new NotFoundException('Business Audio Tour not found');
    }

    await this.repo.remove(tour);
    return { success: true, message: 'Business Audio Tour deleted successfully' };
  }

  async listPaginated(
    page = 1,
    limit = 10,
    filters: ListFilters = {},
  ) {
    const qb = this.repo.createQueryBuilder('bat');

    // Apply filters
    if (filters.businessId) {
      qb.andWhere('bat.business_id = :businessId', {
        businessId: filters.businessId,
      });
    }
    if (filters.active !== undefined) {
      qb.andWhere('bat.active = :active', { active: filters.active });
    }
    if (filters.search) {
      qb.andWhere('bat.name ILIKE :search', { search: `%${filters.search}%` });
    }

    // Add ordering and pagination ← THIS WAS MISSING
    qb.orderBy('bat.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBusinessAudioTourProfile(id: string) {
    const tour = await this.repo.findOne({
      where: { id }
    });
    if (!tour) {
      throw new NotFoundException('Business Audio Tour not found');
    }
    return tour;
  }
}