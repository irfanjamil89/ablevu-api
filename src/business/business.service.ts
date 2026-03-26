import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
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
import { GoogleMapsService } from 'src/google-maps/google-maps.service';
import { AdditionalResource } from 'src/entity/additional_resource.entity';
import { BusinessImages } from 'src/entity/business_images.entity';
import { NotificationService } from 'src/notifications/notifications.service';
import { BusinessCustomSectionsMedia } from 'src/entity/business-custom-sections-media.entity';
import { BusinessAudioTour } from 'src/entity/business_audio_tour.entity';
import * as bcrypt from 'bcrypt';
import { QueryFailedError } from 'typeorm';
import { SyncService } from 'src/sync/sync.service';

type ListFilters = {
  search?: string;
  active?: boolean;
  city?: string;
  country?: string;
  businessTypeId?: string;
  business_status?: string;
  sort_by?: 'name' | 'created_at' | 'views';
  sort_order?: 'ASC' | 'DESC';
};

type List1Filters = {
  page: number;
  limit: number;
  search?: string;
  businessTypeIds?: string;
  featureIds?: string;
  city?: string;
  country?: string;
};

@Injectable()
export class BusinessService {
  constructor(
    private readonly syncService: SyncService,
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

    @InjectRepository(AdditionalResource)
    private readonly resourcesrepo: Repository<AdditionalResource>,

    @InjectRepository(BusinessCustomSectionsMedia)
    private readonly customSectionsMediaRepo: Repository<BusinessCustomSectionsMedia>,

    @InjectRepository(BusinessAudioTour)
    private readonly audioTourRepo: Repository<BusinessAudioTour>,

    @InjectRepository(BusinessImages)
    private readonly imagesRepo: Repository<BusinessImages>,

    private readonly googleMapsService: GoogleMapsService,

    private readonly notificationService: NotificationService,
  ) {}

  private mapGeocodeResultToBusinessFields(result: any) {
    const getComponent = (type: string): string | undefined => {
      const comp = result.address_components?.find((c) =>
        c.types?.includes(type),
      );
      return comp?.long_name;
    };

    return {
      address: result.formatted_address,
      city: getComponent('locality'),
      state: getComponent('administrative_area_level_1'),
      country: getComponent('country'),
      zipcode: getComponent('postal_code'),
      latitude: result.geometry?.location?.lat,
      longitude: result.geometry?.location?.lng,
      place_id: result.place_id,
    };
  }

  private makeSlug(name: string, external_id?: string) {
    return (
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + (external_id ? `-${external_id}` : '')
    );
  }

  async createBusiness(userId: string, dto: CreateBusinessDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!dto.name?.trim()) {
      throw new BadRequestException('Business name is required');
    }
    if (!dto.business_type || dto.business_type.length === 0) {
      throw new BadRequestException('Business type is required');
    }
    if (!dto.description?.trim()) {
      throw new BadRequestException('Business description is required');
    }
    if (!dto.address?.trim()) {
      throw new BadRequestException('Business address (formatted) is required');
    }
    let accessibleCity: AccessibleCity | null = null;
    if (dto.accessible_city_id) {
      accessibleCity = await this.accessibleCityRepo.findOne({
        where: { id: dto.accessible_city_id },
      });
      if (!accessibleCity) {
        throw new BadRequestException('Invalid accessible city id');
      }
    }

    const slug = this.makeSlug(dto.name, dto.external_id);

    let latitude = dto.latitude;
    let longitude = dto.longitude;
    let place_id = dto.place_id;
    let address = dto.address;
    let city = dto.city;
    let state = dto.state;
    let country = dto.country;
    let zipcode = dto.zipcode;

    const needGeocode = (!latitude || !longitude) && dto.address;

    if (needGeocode) {
      try {
        const geo = await this.googleMapsService.geocodeAddress(dto.address);

        if (geo.status === 'OK' && geo.results?.length > 0) {
          const result = geo.results[0];
          const mapped = this.mapGeocodeResultToBusinessFields(result);

          address = mapped.address ?? address;
          city = mapped.city ?? city;
          state = mapped.state ?? state;
          country = mapped.country ?? country;
          zipcode = mapped.zipcode ?? zipcode;
          latitude = mapped.latitude ?? latitude;
          longitude = mapped.longitude ?? longitude;
          place_id = mapped.place_id ?? place_id;
        } else {
          console.warn('No geocode results for:', dto.address);
        }
      } catch (e) {
        console.error('Geocoding failed:', e);
      }
    }
    let finalAccessibleCityId: string | null = dto.accessible_city_id ?? null;

    if (!finalAccessibleCityId) {
      const cityName = (city || '').trim();

      if (cityName) {
        const foundCity = await this.accessibleCityRepo
          .createQueryBuilder('c')
          .where('LOWER(c.city_name) = LOWER(:cityName)', { cityName })
          .getOne();

        if (foundCity) {
          finalAccessibleCityId = foundCity.id;
        }
      }
    }
    const business = this.businessRepo.create({
      ...dto,
      slug,
      owner: user,
      creator: user,
      active: typeof dto.active === 'boolean' ? dto.active : true,
      blocked: false,
      business_status: dto.business_status || 'draft',
      accessible_city_id: finalAccessibleCityId,
      address,
      city,
      state,
      country,
      zipcode,
      latitude,
      longitude,
      place_id,
    });

    const saved = await this.businessRepo.save(business);

    if (dto.business_type?.length) {
      const linked = dto.business_type.map((typeId) =>
        this.linkedrepo.create({
          business_id: saved.id,
          business_type_id: typeId,
          active: true,
          created_by: userId,
          modified_by: userId,
        }),
      );
      await this.linkedrepo.save(linked);
    }

    if (dto.accessible_feature_id?.length) {
      const linked = dto.accessible_feature_id.map((featureId) =>
        this.businessaccessibilityrepo.create({
          business_id: saved.id,
          accessible_feature_id: featureId,
          active: true,
          created_by: userId,
          modified_by: userId,
        }),
      );
      await this.businessaccessibilityrepo.save(linked);
    }
    try {
      await this.notificationService.notifyBusinessCreated(saved.name, userId, saved.id, saved.address, saved.created_at);
    } catch (err) {
      console.error('Failed to notify admins:', err);
    }

    return saved;
  }
  async updateBusiness(id: string, userId: string, dto: UpdateBusinessDto) {
    const business = await this.businessRepo.findOne({ where: { id } });
    if (!business) throw new NotFoundException('Business not found');
    if (dto.name && dto.name.trim() !== '') {
      business.name = dto.name.trim();
      business.slug = this.makeSlug(dto.name);
    }

    if (dto.owner_email) {
      const email = dto.owner_email.trim().toLowerCase();

      let owner = await this.userRepo.findOne({ where: { email } });

      if (!owner) {
        try {
          const hashed = await bcrypt.hash('12345678', 10);

          owner = await this.userRepo.save(
            this.userRepo.create({
              email,
              password: hashed,
              user_role: 'Business',
              archived: false,
              paid_contributor: false,
            }),
          );
        } catch (e) {
          if (e instanceof QueryFailedError) {
            owner = await this.userRepo.findOne({ where: { email } });
          }
          if (!owner) throw e;
        }
      }

      business.owner_user_id = owner.id;
    }
    const { owner_email, ...safeDto } = dto as any;
    Object.assign(business, safeDto);

    const hasAddress =
      typeof business.address === 'string' && business.address.trim() !== '';

    const coordsMissing = !business.latitude || !business.longitude;
    const addressChanged = !!dto.address;

    const shouldGeocode = hasAddress && (coordsMissing || addressChanged);

    if (shouldGeocode) {
      try {
        const geo = await this.googleMapsService.geocodeAddress(
          business.address as string,
        );

        if (geo.status === 'OK' && geo.results && geo.results.length > 0) {
          const result = geo.results[0];
          const mapped = this.mapGeocodeResultToBusinessFields(result);

          business.address = mapped.address ?? business.address;
          business.city = mapped.city ?? business.city;
          business.state = mapped.state ?? business.state;
          business.country = mapped.country ?? business.country;
          business.zipcode = mapped.zipcode ?? business.zipcode;
          business.latitude = mapped.latitude ?? business.latitude;
          business.longitude = mapped.longitude ?? business.longitude;
          business.place_id = mapped.place_id ?? business.place_id;
        } else {
          console.warn(
            'Geocode did not return results for business update:',
            business.address,
          );
        }
      } catch (e) {
        console.error('Geocoding failed during update but continuing:', e);
      }
    }
    await this.businessRepo.save(business);
    const relationActive =
      typeof dto.active === 'boolean'
        ? dto.active
        : typeof business.active === 'boolean'
          ? business.active
          : true;

    if (dto.business_type && dto.business_type.length > 0) {
      await this.linkedrepo.delete({ business_id: id });

      const linkedEntries = dto.business_type.map((typeId) =>
        this.linkedrepo.create({
          business_id: id,
          business_type_id: typeId,
          active: relationActive,
          created_by: userId,
          modified_by: userId,
        }),
      );
      await this.linkedrepo.save(linkedEntries);
    }
    if (dto.accessible_feature_id && dto.accessible_feature_id.length > 0) {
      await this.businessaccessibilityrepo.delete({ business_id: id });

      const linkedFeature = dto.accessible_feature_id.map((typeId) =>
        this.businessaccessibilityrepo.create({
          business_id: id,
          accessible_feature_id: typeId,
          active: relationActive,
          created_by: userId,
          modified_by: userId,
        }),
      );
      await this.businessaccessibilityrepo.save(linkedFeature);
    }
setImmediate(async () => {
    await this.syncService.syncSingleBusiness(id);
  });

  return business;
}

  async updateBusinessByExternalId(
    external_id: string,
    updateData: CreateBusinessDto,
  ) {
    try {
      const existingBusiness = await this.businessRepo.findOne({
        where: { external_id: external_id },
      });

      if (!existingBusiness) {
        throw new NotFoundException(
          `Business with external_id ${external_id} not found`,
        );
      }
      const updatedBusiness = await this.businessRepo.save({
        ...existingBusiness,
        ...updateData,
        id: existingBusiness.id,
        modified_at: new Date(),
      });

      console.log(
        `Successfully updated business with external_id: ${external_id}`,
      );
      return updatedBusiness;
    } catch (error) {
      console.error(
        `Error updating business with external_id ${external_id}:`,
        error,
      );
      throw error;
    }
  }
  async deleteBusiness(id: string, userId: string) {
    const business = await this.businessRepo.findOne({ where: { id } });
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    await this.virtualTourRepo.delete({ business: { id: business.id } });

    await this.audioTourRepo.delete({ business_id: id });

    await this.businessreviews.delete({ business_id: id });

    await this.businessquestionrepo.delete({ business_id: id });

    await this.businessPartnerrepo.delete({ business_id: id });

    await this.customSectionsrepo.delete({ business_id: id });

    await this.mediaRepo.delete({ business_id: id });

    await this.scheduleRepo.delete({ business: { id: business.id } });

    await this.linkedrepo.delete({ business_id: id });

    await this.businessaccessibilityrepo.delete({ business_id: id });

    await this.recomendationRepo.delete({ business: { id: business.id } });

    await this.resourcesrepo.delete({ business_id: id });

    await this.imagesRepo.delete({ business_id: id });

    await this.businessRepo.remove(business);
  }

  async listPaginated(
    page = 1,
    limit = 10,
    filters: ListFilters = {},
    currentUser?: User,
  ) {
    const qb = this.businessRepo.createQueryBuilder('b');

    qb.leftJoin('b.owner', 'u').addSelect(
      'u.last_login_at',
      'owner_last_login_at',
    );

    qb.take(limit).skip((page - 1) * limit);

    if (currentUser?.user_role) {
      const role = currentUser.user_role.toLowerCase();

      if (role === 'business') {
        qb.andWhere('b.owner_user_id = :ownerId', { ownerId: currentUser.id });
      } else if (role === 'contributor') {
        qb.andWhere('b.owner_user_id = :ownerId', { ownerId: currentUser.id });
      }
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

    if (filters.business_status?.trim()) {
      qb.andWhere('LOWER(b.business_status) = :st', {
        st: filters.business_status.trim().toLowerCase(),
      });
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

    const allowedSort: Record<string, string> = {
      name: 'b.name',
      created_at: 'b.created_at',
      views: 'b.views',
    };

    const sortCol =
      allowedSort[filters.sort_by || 'created_at'] || 'b.created_at';
    const sortOrder =
      (filters.sort_order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(sortCol, sortOrder);

    const { entities: items, raw } = await qb.getRawAndEntities();
    const total = await qb.getCount();

    const data = await Promise.all(
      items.map(async (business, idx) => {
        const owner_last_login_at = raw?.[idx]?.owner_last_login_at ?? null;
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
          additionalaccessibilityresources,
          businessImages,
        ] = await Promise.all([
          this.linkedrepo.find({ where: { business_id: business.id } }),
          this.businessaccessibilityrepo.find({
            where: { business_id: business.id },
          }),
          this.virtualTourRepo.find({
            where: { business: { id: business.id } },
            order: { display_order: 'ASC' },
          }),
          this.businessreviews.find({ where: { business_id: business.id } }),
          this.businessquestionrepo.find({
            where: { business_id: business.id },
          }),
          this.businessPartnerrepo.find({
            where: { business_id: business.id },
          }),
          this.customSectionsrepo.find({ where: { business_id: business.id } }),
          this.mediaRepo.find({ where: { business_id: business.id } }),
          this.scheduleRepo.find({ where: { business: { id: business.id } } }),
          this.recomendationRepo.find({
            where: { business: { id: business.id } },
          }),
          this.resourcesrepo.find({ where: { business_id: business.id } }),
          this.imagesRepo.find({ where: { business_id: business.id } }),
        ]);

        return {
          ...business,
          owner_last_login_at,
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
          additionalaccessibilityresources,
          businessImages,
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

  async list1Paginated({
    page = 1,
    limit = 10,
    search,
    businessTypeIds,
    featureIds,
    city,
    country,
  }: List1Filters) {
    const qb = this.businessRepo.createQueryBuilder('b');
    qb.where('LOWER(b.business_status) IN (:...statuses)', {
      statuses: ['approved', 'claimed', 'submitted'],
    });

    if (search && search.trim()) {
      const s = `%${search.trim().toLowerCase()}%`;
      qb.andWhere(
        `(LOWER(b.name) LIKE :s
         OR LOWER(b.address) LIKE :s
         OR LOWER(b.city) LIKE :s
         OR LOWER(b.state) LIKE :s
         OR LOWER(b.country) LIKE :s)`,
        { s },
      );
    }

    if (city && city.trim()) {
      qb.andWhere('LOWER(b.city) = :city', {
        city: city.trim().toLowerCase(),
      });
    }

    if (country && country.trim()) {
      qb.andWhere('LOWER(b.country) = :country', {
        country: country.trim().toLowerCase(),
      });
    }
    if (businessTypeIds && businessTypeIds.trim()) {
      const btIds = businessTypeIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      if (btIds.length) {
        qb.andWhere(
          `b.id IN (
          SELECT blt.business_id
          FROM business_linked_type blt
          WHERE blt.business_type_id IN (:...btIds)
        )`,
          { btIds },
        );
      }
    }
    if (featureIds && featureIds.trim()) {
      const afIds = featureIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      if (afIds.length) {
        qb.andWhere(
          `b.id IN (
          SELECT baf.business_id
          FROM business_accessible_feature baf
          WHERE baf.accessible_feature_id IN (:...afIds)
        )`,
          { afIds },
        );
      }
    }

    qb.take(limit)
      .skip((page - 1) * limit)
      .orderBy('b.created_at', 'DESC');

    const [items, total] = await qb.getManyAndCount();
    const data = await Promise.all(
      items.map(async (business) => {
        const [
          // linkedTypes,
          // accessibilityFeatures,
          // virtualTours,
          // businessreviews,
          // businessQuestions,
          // businessPartners,
          // businessCustomSections,
          // businessMedia,
          // businessSchedule,
          // businessRecomendations,
          // additionalaccessibilityresources,
          // businessImages,
        ] = await Promise.all([
          //   this.linkedrepo.find({ where: { business_id: business.id } }),
          //   this.businessaccessibilityrepo.find({
          //     where: { business_id: business.id },
          //     relations: ['accessible_feature'], // agar relation banaya ho to
          //   }),
          //   this.virtualTourRepo.find({
          //     where: { business: { id: business.id } },
          //     order: { display_order: 'ASC' },
          //   }),
          //   this.businessreviews.find({ where: { business_id: business.id } }),
          //   this.businessquestionrepo.find({ where: { business_id: business.id } }),
          //   this.businessPartnerrepo.find({ where: { business_id: business.id } }),
          //   this.customSectionsrepo.find({ where: { business_id: business.id } }),
          //   this.mediaRepo.find({ where: { business_id: business.id } }),
          //   this.scheduleRepo.find({ where: { business: { id: business.id } } }),
          //   this.recomendationRepo.find({
          //     where: { business: { id: business.id } },
          //   }),
          //   this.resourcesrepo.find({ where: { business_id: business.id } }),
          //   this.imagesRepo.find({ where: { business_id: business.id } }),
        ]);

        return {
          ...business,
          // linkedTypes,
          // accessibilityFeatures,
          // virtualTours,
          // businessreviews,
          // businessQuestions,
          // businessPartners,
          // businessCustomSections,
          // businessMedia,
          // businessSchedule,
          // businessRecomendations,
          // additionalaccessibilityresources,
          // businessImages,
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

  async list2Paginated({ page = 1, limit = 10 }: List1Filters) {
    const qb = this.businessRepo.createQueryBuilder('b');

    qb.orderBy('b.created_at', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);
    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateBusinessStatus(id: string, dto: any, userId: string) {
    const business = await this.businessRepo.findOne({ where: { id } });
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    business.business_status = dto.business_status;
    await this.businessRepo.save(business);
    this.notificationService.notifyBusinessStatusUpdated({
      businessId: business.id,
      businessName: business.name,
      triggeredBy: userId,
      newStatus: dto.business_status,
    });
  }
  async getBusinessProfile(id: string, currentUser?: any) {
    const business = await this.businessRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.owner', 'o')
      .where('b.id = :id', { id })
      .select([
        'b',
        'o.id',
        'o.first_name',
        'o.last_name',
        'o.email',
        'o.profile_picture_url',
      ])
      .getOne();

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    await this.businessRepo.increment({ id }, 'views', 1);

    const businessWithUpdatedViews = {
      ...business,
      views: (business.views ?? 0) + 1,
    };

    const [
      linkedTypes,
      accessibilityFeatures,
      virtualTours,
      audioTours,
      businessreviews,
      businessQuestions,
      businessPartners,
      businessCustomSections,
      businessCustomSectionsMedia,
      businessMedia,
      businessSchedule,
      businessRecomendations,
      additionalaccessibilityresources,
      businessImages,
    ] = await Promise.all([
      this.linkedrepo.find({ where: { business_id: business.id } }),
      this.businessaccessibilityrepo.find({
        where: { business_id: business.id },
      }),
      this.virtualTourRepo.find({
        where: { business: { id: business.id } },
        order: { display_order: 'ASC' },
      }),
      this.audioTourRepo.find({ where: { business_id: business.id } }),
      this.businessreviews.find({
        where: { business_id: business.id, approved: true },
      }),
      this.businessquestionrepo.find({ where: { business_id: business.id } }),
      this.businessPartnerrepo.find({ where: { business_id: business.id } }),
      this.customSectionsrepo.find({ where: { business_id: business.id } }),
      this.customSectionsMediaRepo.find({
        where: { business_id: business.id },
      }),
      this.mediaRepo.find({ where: { business_id: business.id } }),
      this.scheduleRepo.find({ where: { business: { id: business.id } } }),
      this.recomendationRepo.find({ where: { business: { id: business.id } } }),
      this.resourcesrepo.find({ where: { business_id: business.id } }),
      this.imagesRepo.find({ where: { business_id: business.id } }),
    ]);
    const businessQuestionsWithNames = await Promise.all(
      businessQuestions.map(async (q) => {
        let createdByName: string | null = null;
        if (q.show_name) {
          const user = await this.userRepo.findOne({
            where: { id: q.created_by },
            select: ['first_name', 'last_name'],
          });
          if (user) {
            createdByName =
              `${user.first_name || ''} ${user.last_name || ''}`.trim();
          }
        }
        return { ...q, created_by_name: createdByName };
      }),
    );
    const businessReviewsWithNames = await Promise.all(
      businessreviews.map(async (r) => {
        let createdByName: string | null = null;
        const user = await this.userRepo.findOne({
          where: { id: r.created_by },
          select: ['first_name', 'last_name'],
        });
        if (user) {
          createdByName =
            `${user.first_name || ''} ${user.last_name || ''}`.trim();
        }
        return { ...r, created_by_name: createdByName };
      }),
    );

    return {
      ...business,
      linkedTypes,
      accessibilityFeatures,
      virtualTours,
      audioTours,
      businessreviews: businessReviewsWithNames,
      businessQuestions: businessQuestionsWithNames,
      businessPartners,
      businessCustomSections,
      businessCustomSectionsMedia,
      businessMedia,
      businessSchedule,
      businessRecomendations,
      additionalaccessibilityresources,
      businessImages,
      owner: {
        email: business.owner.email,
      },
    };
  }

  async findById(id: string): Promise<Business | null> {
    return this.businessRepo.findOne({
      where: { id },
      relations: ['owner'],
    });
  }

  async findByExternalId(externalId: string): Promise<Business | null> {
    return this.businessRepo.findOne({ where: { external_id: externalId } });
  }
}
