import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from 'src/entity/business.entity';
import { CreateBusinessDto } from './create-business.dto';
import { UpdateBusinessDto } from './update-business.dto';
import { User } from 'src/entity/user.entity';
import { BusinessLinkedType } from 'src/entity/business_linked_type.entity';
import { BusinessAccessibleFeature } from 'src/entity/business_accessiblity_feature.entuty';

type ListFilters = {
  search?: string;
  active?: boolean;
  city?: string;
  country?: string;
   businessTypeId?: string;
};

@Injectable()
export class BusinessService {
constructor(
  @InjectRepository(Business)
  private readonly businessRepo: Repository<Business>,

  @InjectRepository(User)
  private readonly userRepo: Repository<User>,

  @InjectRepository(BusinessLinkedType)
  private readonly linkedrepo: Repository<BusinessLinkedType>,

  @InjectRepository(BusinessAccessibleFeature)
  private readonly businessaccessibilityrepo: Repository<BusinessAccessibleFeature>

) {}

  private makeSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async createBusiness(userId: string, dto: CreateBusinessDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('user not found');

     if (!dto.name?.trim()) {
      throw new BadRequestException('Business name is required');
    }
    if (!dto.business_type){
      throw new BadRequestException(" Business Type is Missimg")
    }
    if (!dto.description?.trim()) {
      throw new BadRequestException('Business description is required');
    }
    if (!dto.address?.trim()) {
      throw new BadRequestException('Business address is required');
    }
    if (!dto.city?.trim()) {
      throw new BadRequestException('City is required');
    }
    if (!dto.state?.trim()) {
      throw new BadRequestException('State is required');
    }
    if (!dto.country?.trim()) {
      throw new BadRequestException('Country is required');
    }
    if (!dto.zipcode?.trim()) {
      throw new BadRequestException('Zip code is required');
    }
    const slug = this.makeSlug(dto.name);
    
    const business = this.businessRepo.create({
      ...dto,
      slug,
      ownerUserId: user.id,
      creatorUserId: user.id,
      active: true,
      blocked: false,
    });
    const savedbusiness = await this.businessRepo.save(business);

    if (dto.business_type && dto.business_type.length > 0) {
      const linkedEntries = dto.business_type.map((typeId) =>
        this.linkedrepo.create({
          business_id: savedbusiness.id,
          business_type_id: typeId,
          active: dto.active,
          created_by: userId,
          modified_by: userId,
        }),
      );
    if (dto.accessible_feature_id && dto.accessible_feature_id.length > 0) {
      const linkedFeature = dto.accessible_feature_id.map((typeId) =>
        this.businessaccessibilityrepo.create({
          business_id: savedbusiness.id,
          accessible_feature_id: typeId,
          active: dto.active,
          created_by: userId,
          modified_by: userId,
        }),
      );
      await this.linkedrepo.save(linkedEntries);
      await this.businessaccessibilityrepo.save(linkedFeature);
    }
  }
  }
  async updateBusiness(id: string, userId: string, dto: UpdateBusinessDto) {
    const business = await this.businessRepo.findOne({ where: { id } });
    if (!business){ 
      throw new NotFoundException('Business not found');
    }
    if (dto.name && dto.name.trim() !== '') {
      business.name = dto.name;
      business.slug = this.makeSlug(dto.name);
    }
    Object.assign(business, dto);
    await this.businessRepo.save(business);

    if (dto.business_type && dto.business_type.length > 0) {
      const linkedEntries = dto.business_type.map((typeId) =>
        this.linkedrepo.create({
          business_id: id,
          business_type_id: typeId,
          active: dto.active,
          created_by: userId,
          modified_by: userId,
        }),
      );
      if (dto.accessible_feature_id && dto.accessible_feature_id.length > 0) {
      const linkedFeature = dto.accessible_feature_id.map((typeId) =>
        this.businessaccessibilityrepo.create({
          business_id: id,
          accessible_feature_id: typeId,
          active: dto.active,
          created_by: userId,
          modified_by: userId,
        }),
      );
      await this.linkedrepo.save(linkedEntries);
      await this.businessaccessibilityrepo.save(linkedFeature);
    }
    }
  }
  async deleteBusiness(id: string) {
    const business = await this.businessRepo.findOne({ where: { id } });
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    await this.linkedrepo.delete({ business_id: id });          
    await this.businessRepo.remove(business);
    return{ message: 'Business deleted successfully'}
  }

  async listPaginated(
    page = 1,
    limit = 10,
    filters: ListFilters = {},
  ) {
    const qb = this.businessRepo.createQueryBuilder('b');

    qb.take(limit)
      .skip((page - 1) * limit)
      .orderBy('b.created_at', 'DESC');

    if (filters.active !== undefined) {
      qb.andWhere('b.active = :active', { active: filters.active });
    }

    if (filters.city) {
      const city = `%${filters.city.toLowerCase()}%`;
      qb.andWhere('LOWER(b.city) LIKE :city', { city });
    }

    if (filters.country) {
      const country = `%${filters.country.toLowerCase()}%`;
      qb.andWhere('LOWER(b.country) LIKE :country', { country });
    }

    if (filters.search) {
      const search = `%${filters.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(b.name) LIKE :search OR LOWER(b.address) LIKE :search OR LOWER(b.city) LIKE :search OR LOWER(b.country) LIKE :search)',
        { search },
      );
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBusinessProfile(id: string) {
    const business = await this.businessRepo.findOne({ where: { id } });  
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return business;
  }
}


