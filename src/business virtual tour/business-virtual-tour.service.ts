import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessVirtualTour } from '../entity/business_virtual_tours.entity';
import { Business } from 'src/entity/business.entity';
import { CreateBusinessVirtualTour } from './create-business-virtual-tour.dto';
import { UpdateBusinessVirtualTour } from './update-business-virtual-tour.dto';

type ListFilters = {
  businessId?: string;
  active?: boolean;
  search?: string;
};
@Injectable()
export class BusinessVirtualTourService {
  constructor(
    @InjectRepository(BusinessVirtualTour)
    private readonly repo: Repository<BusinessVirtualTour>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
  
  ) {}
  async createBusinessVirtualTour(userId: string, dto: CreateBusinessVirtualTour) {
     const business = await this.businessRepo.findOne({
      where: { id: dto.businessId },
    });
    if (!dto.name?.trim()) {
      throw new BadRequestException('The field "name" is required and cannot be empty.');
    }

    if (!dto.linkUrl?.trim()) {
      throw new BadRequestException('The field "linkUrl" is required and cannot be empty.');
    }

    if (!dto.businessId?.trim()) {
      throw new BadRequestException('The field "businessId" is required and cannot be empty.');
    }
    if (!business) {
      throw new NotFoundException(
        `No business found against businessId: ${dto.businessId}`,
      );
    }
    const tour = this.repo.create({
    name: dto.name,
    display_order: dto.displayOrder,
    link_url: dto.linkUrl,
    business_id: dto.businessId,  
    active: dto.active ?? true,
    created_by: userId,
    modified_by: userId,
  });

    return this.repo.save(tour);
  }

  async updateBusinessVirtualTour(
    id: string,
    userId: string,
    dto: UpdateBusinessVirtualTour,
  ) {
    const tour = await this.repo.findOne({ where: { id } });
    if (!tour) {
      throw new NotFoundException('Business Virtual Tour not found');
    }

    Object.assign(tour, dto);
    tour.modified_by = userId;

    return this.repo.save(tour);
  }

  async deleteBusinessVirtualTour(id: string) {
    const result = await this.repo.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Business Virtual Tour not found');
    }
    return { success: true };
  }

  async listPaginated(
    page = 1,
    limit = 10,
    filters: ListFilters = {},
  ) {
    const qb = this.repo.createQueryBuilder('vt');

    if (filters.businessId) {
      qb.andWhere('vt.businessId = :businessId', {
        businessId: filters.businessId,
      });
    }
    if (filters.active !== undefined) {
      qb.andWhere('vt.active = :active', { active: filters.active });
    }
    if (filters.search) {
      qb.andWhere('vt.name ILIKE :search', { search: `%${filters.search}%` });
    }
    qb.orderBy('vt.display_order', 'ASC')
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

  async getBusinessVirtualTourProfile(id: string) {
    const tour = await this.repo.findOne({
      where: { id }
    });
    if (!tour) {
      throw new NotFoundException('Business Virtual Tour not found');
    }
    return tour;
  }
}
