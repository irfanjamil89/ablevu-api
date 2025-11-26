import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from 'src/entity/business.entity';
import { CreateBusinessDto } from './create-business.dto';
import { UpdateBusinessDto } from './update-business.dto';
import { User } from 'src/entity/user.entity';
import { BusinessLinkedType } from 'src/entity/business_linked_type.entity';
import { BusinessAccessibleFeature } from 'src/entity/business_accessiblity_feature.entity';
import { BusinessVirtualTour } from 'src/entity/business_virtual_tours.entity';
import { BusinessReviews } from 'src/entity/business_reviews.entity';
import { BusinessQuestions } from 'src/entity/business-questions.entity';
import { Partner } from 'src/entity/partner.entity';
import { BusinessPartners } from 'src/entity/business_partners.entity';
import { BusinessCustomSections } from 'src/entity/business_custom_sections.entity';
import { BusinessMedia } from 'src/entity/business_media.entity';
import { AccessibleCity } from 'src/entity/accessible_city.entity';
import { BusinessSchedule } from 'src/entity/business_schedule.entity';
import { privateDecrypt } from 'crypto';
import { BusinessRecomendations } from 'src/entity/business_recomendations.entity';



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
  private readonly businessaccessibilityrepo: Repository<BusinessAccessibleFeature>,

  @InjectRepository(BusinessVirtualTour)
  private readonly virtualTourRepo: Repository<BusinessVirtualTour>,

  @InjectRepository(BusinessReviews)
  private readonly businessreviews: Repository<BusinessReviews>,

  @InjectRepository(BusinessQuestions)
  private readonly businessquestionrepo: Repository<BusinessQuestions>,

  @InjectRepository(BusinessPartners)
  private readonly businessPartnerrepo: Repository<BusinessPartners>,

  @InjectRepository(BusinessCustomSections)
  private readonly customSectionsrepo: Repository<BusinessCustomSections>,

  @InjectRepository(BusinessMedia)
  private readonly mediaRepo: Repository<BusinessMedia>,

  @InjectRepository(AccessibleCity)
  private readonly accessibleCityRepo: Repository<AccessibleCity>,

  @InjectRepository(BusinessSchedule)
  private readonly scheduleRepo: Repository<BusinessSchedule>,

  @InjectRepository(BusinessRecomendations)
  private readonly recomendationRepo: Repository<BusinessRecomendations>,

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

     let accessibleCity: AccessibleCity | null = null;
  if (dto.accessible_city_id) {
    accessibleCity = await this.accessibleCityRepo.findOne({
      where: { id: dto.accessible_city_id},
    });
    if (!accessibleCity) {
      throw new BadRequestException('Invalid accessible city id');
    }
  }
    const slug = this.makeSlug(dto.name);
    
    const business = this.businessRepo.create({
      ...dto,
      slug,
      owner: user,
      creator: user,
      active: true,
      blocked: false,
      accessibleCity: dto.accessible_city_id
      ? ({ id: dto.accessible_city_id } as any)
      : null,
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
      await this.linkedrepo.save(linkedEntries);
    }
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
      await this.businessaccessibilityrepo.save(linkedFeature);
    }
    return savedbusiness;
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
      await this.linkedrepo.save(linkedEntries);
    }
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
      await this.businessaccessibilityrepo.save(linkedFeature);
    }
  }
  async deleteBusiness(id: string, userId: string) {
    const business = await this.businessRepo.findOne({ where: { id } });
    if (!business){ 
      throw new NotFoundException('Business not found');
    }
    await this.recomendationRepo.delete({business: { id: business.id }});
    await this.businessaccessibilityrepo.delete({business_id: id});
    await this.scheduleRepo.delete({business: { id: business.id }});
    await this.customSectionsrepo.delete({ business_id: id });          
    await this.linkedrepo.delete({ business_id: id });          
    await this.businessRepo.remove(business);
  }

  async listPaginated(
  page = 1,
  limit = 10,
  filters: ListFilters = {},
  currentUser?: User,
) {
  const qb = this.businessRepo.createQueryBuilder('b');

  qb.take(limit)
    .skip((page - 1) * limit)
    .orderBy('b.created_at', 'DESC');

  // 🔹 Role-based filter for Business & Contributor
  if (currentUser?.user_role) {
    const role = currentUser.user_role.toLowerCase();

    if (role === 'business' || role === 'contributor') {
      qb.andWhere('b.owner_user_id = :ownerId', {
        ownerId: currentUser.id,
      });
    }
    // Admin = no filter
  }

  if (filters.active !== undefined) {
    qb.andWhere('b.active = :active', { active: filters.active });
  }

  if (filters.city) {
    qb.andWhere('LOWER(b.city) LIKE :city', {
      city: `%${filters.city.toLowerCase()}%`,
    });
  }

  if (filters.country) {
    qb.andWhere('LOWER(b.country) LIKE :country', {
      country: `%${filters.country.toLowerCase()}%`,
    });
  }

  if (filters.search) {
    const search = `%${filters.search.toLowerCase()}%`;
    qb.andWhere(
      '(LOWER(b.name) LIKE :search OR LOWER(b.address) LIKE :search OR LOWER(b.city) LIKE :search OR LOWER(b.country) LIKE :search)',
      { search },
    );
  }

  if (filters.businessTypeId) {
    qb.andWhere(
      `EXISTS (
        SELECT 1
        FROM business_linked_type blt
        WHERE blt.business_id = b.id
        AND blt.business_type_id = :btId
      )`,
      { btId: filters.businessTypeId },
    );
  }

  const [items, total] = await qb.getManyAndCount();

  const data = await Promise.all(
    items.map(async (business) => {
      const [
        linkedTypes,
        accessibilityFeatures,
        virtualTours,
        businessreviews,
        businessQuestions,
        businessPartners,
        businessCustomSections,
        businessMedia,
        businessSchedule,
        businessRecomendations,
      ] = await Promise.all([
        this.linkedrepo.find({ where: { business_id: business.id } }),
        this.businessaccessibilityrepo.find({ where: { business_id: business.id } }),
        this.virtualTourRepo.find({
          where: { business: { id: business.id } },
          order: { display_order: 'ASC' },
        }),
        this.businessreviews.find({ where: { business_id: business.id } }),
        this.businessquestionrepo.find({ where: { business_id: business.id } }),
        this.businessPartnerrepo.find({ where: { business_id: business.id } }),
        this.customSectionsrepo.find({ where: { business_id: business.id } }),
        this.mediaRepo.find({ where: { business_id: business.id } }),
        this.scheduleRepo.find({ where: { business: { id: business.id } } }),
        this.recomendationRepo.find({ where: { business: { id: business.id } } }),
      ]);

      return {
        ...business,
        linkedTypes,
        accessibilityFeatures,
        virtualTours,
        businessreviews,
        businessQuestions,
        businessPartners,
        businessCustomSections,
        businessMedia,
        businessSchedule,
        businessRecomendations,
      };
    }),
  );

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

    const [linkedTypes, accessibilityFeatures, virtualTours, businessreviews, businessQuestions, businessPartners, businessCustomSections, businessMedia, businessSchedule, businessRecomendations] = await Promise.all([
        this.linkedrepo.find({
          where: { business_id: business.id },
        }),
        this.businessaccessibilityrepo.find({
          where: { business_id: business.id },
        }),
        this.virtualTourRepo.find({
          where: { business: {id: business.id}},
          order: { display_order: 'ASC' },
        }),
        this.businessreviews.find({
          where: {business_id: business.id},
        }),
        this.businessquestionrepo.find({
          where: {business_id: business.id,}
        }),
        this.businessPartnerrepo.find({
          where: {business_id: business.id,}
        }),
        this.customSectionsrepo.find({
          where: {business_id: business.id,}
        }),
        this.mediaRepo.find({
          where: {business_id: business.id,}
        }),
        this.scheduleRepo.find({
          where: {business: {id : business.id,}}
        }),
        this.recomendationRepo.find({
          where: {business: {id: business.id,}}
        })
      ]);

    return {
      ...business,
      linkedTypes,          
      accessibilityFeatures,
      virtualTours,         
      businessreviews,
      businessQuestions,
      businessPartners,
      businessCustomSections,
      businessMedia,
      businessSchedule,
      businessRecomendations,
    };
  }
}