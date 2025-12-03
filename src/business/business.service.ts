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
import { GoogleMapsService } from 'src/google-maps/google-maps.service';

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

   private readonly googleMapsService: GoogleMapsService,

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
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')+(external_id ? `-${external_id}` : '');
  }

  async createBusiness(userId: string, dto: CreateBusinessDto) {
  const user = await this.userRepo.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');

  // ⭐ Required fields only (Option A)
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

  // ⭐ Accessible City (optional)
  let accessibleCity: AccessibleCity | null = null;
  if (dto.accessible_city_id) {
    accessibleCity = await this.accessibleCityRepo.findOne({
      where: { id: dto.accessible_city_id },
    });
    if (!accessibleCity) {
      throw new BadRequestException('Invalid accessible city id');
    }
  }

  const slug = this.makeSlug(dto.name,dto.external_id);

  let latitude = dto.latitude;
  let longitude = dto.longitude;
  let place_id = dto.place_id;

  // Address parts (will be auto-filled by geocoder)
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

  // ───────────────────────────────────────────────

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

    // overwrite auto-filled fields
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

  // ⭐ Business Types
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

  // ⭐ Accessible Features
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

  return saved;
}

  async updateBusiness(id: string, userId: string, dto: UpdateBusinessDto) {
  const business = await this.businessRepo.findOne({ where: { id } });
  if (!business) {
    throw new NotFoundException('Business not found');
  }
  if (dto.name && dto.name.trim() !== '') {
    business.name = dto.name.trim();
    business.slug = this.makeSlug(dto.name);
  }

  Object.assign(business, dto);

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
  // ──────── END GOOGLE MAPS ────────

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

  // 🔹 Update Accessible Features (agar body mein bheje gaye hon)
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

  return business;
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

  async getBusinessProfile(id: string, currentUser?: any) {
  const business = await this.businessRepo.findOne({ where: { id } });

  if (!business) {
    throw new NotFoundException('Business not found');
  }

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
}
  async findByExternalId(externalId: string): Promise<Business | null> {
    return this.businessRepo.findOne({ where: { external_id: externalId } });
  }
}