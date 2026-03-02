import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessibleCity } from '../entity/accessible_city.entity';
import { CreateAccessibleCityDto } from './create-accessible-city.dto';
import { User } from 'src/entity/user.entity';
import { Business } from 'src/entity/business.entity';
import { In } from 'typeorm';

@Injectable()
export class AccessibleCityService {
  constructor(
    @InjectRepository(AccessibleCity)
    private readonly accessiblecityrepo: Repository<AccessibleCity>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
  ) { }

  private makeSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  // Find city by external_id
  async findByExternalId(externalId: string): Promise<AccessibleCity | null> {
    return await this.accessiblecityrepo.findOne({
      where: { external_id: externalId }
    });
  }

  // NEW METHOD: Update city by external_id
  async updateAccessibleCityByExternalId(
    externalId: string,
    userId: string,
    dto: CreateAccessibleCityDto
  ) {
    const city = await this.accessiblecityrepo.findOne({
      where: { external_id: externalId }
    });

    if (!city) {
      throw new NotFoundException('Accessible City not found with external_id: ' + externalId);
    }

    // Update city fields
    if (dto.cityName && dto.cityName.trim() !== '') {
      city.city_name = dto.cityName;
      city.slug = this.makeSlug(dto.cityName);
    }
    if (dto.featured !== undefined) city.featured = dto.featured;
    if (dto.latitude !== undefined) city.latitude = dto.latitude;
    if (dto.longitude !== undefined) city.longitude = dto.longitude;
    if (dto.displayOrder !== undefined) city.display_order = dto.displayOrder;
    if (dto.pictureUrl !== undefined) city.picture_url = dto.pictureUrl;

    city.modified_by = userId;
    await this.accessiblecityrepo.save(city);

    // Clear old business associations
    const oldBusinesses = await this.businessRepo.find({
      where: { accessible_city_id: city.id }
    });
    for (const b of oldBusinesses) {
      b.accessible_city_id = null;
    }
    await this.businessRepo.save(oldBusinesses);

    // Add new business associations
    if (dto.business_Ids?.length) {
      const businesses = await this.businessRepo.findBy({ id: In(dto.business_Ids) });
      if (businesses.length !== dto.business_Ids.length) {
        throw new BadRequestException('One or more business IDs are invalid');
      }
      for (const b of businesses) {
        b.accessible_city_id = city.id;
      }
      await this.businessRepo.save(businesses);
    }

    return city;
  }

  async createAccessibleCity(UserId: string, dto: CreateAccessibleCityDto, externalId: string) {
    const user = await this.userRepo.findOne({ where: { id: UserId } });
    if (!user) throw new NotFoundException('user not found');

    if (!dto.cityName?.trim()) {
      throw new BadRequestException('City name is required');
    }

    const slug = this.makeSlug(dto.cityName);
    const existing = await this.accessiblecityrepo.findOne({
      where: [{ city_name: dto.cityName },
      { slug: slug }],
    });

    if (existing) {
      throw new BadRequestException('City with this name already exists');
    }

    const city = this.accessiblecityrepo.create({
      city_name: dto.cityName,
      featured: dto.featured,
      latitude: dto.latitude,
      longitude: dto.longitude,
      display_order: dto.displayOrder,
      picture_url: dto.pictureUrl,
      slug,
      created_by: UserId,
      modified_by: UserId,
      external_id: externalId,
    });
    const saved_city = await this.accessiblecityrepo.save(city);
    if (dto.business_Ids?.length) {
      const businesses = await this.businessRepo.findBy({ id: In(dto.business_Ids) });
      if (businesses.length !== dto.business_Ids.length) {
        throw new BadRequestException('One or more business IDs are invalid');
      }
      for (const b of businesses) {
        b.accessible_city_id = saved_city.id;
      }

      await this.businessRepo.save(businesses);
    }
    return saved_city;
  }

  // async updateAccessibleCity(id: string, userId: string, dto: any) {
  //   const accessiblecity = await this.accessiblecityrepo.findOne({ where: { id } });
  //   if (!accessiblecity) {
  //     throw new NotFoundException('Accessible City not found');
  //   }
  //   if (dto.cityName && dto.cityName.trim() !== '') {
  //     accessiblecity.city_name = dto.cityName;
  //     accessiblecity.slug = this.makeSlug(dto.cityName);
  //   }
  //   if (dto.featured !== undefined) accessiblecity.featured = dto.featured;
  //   if (dto.latitude !== undefined) accessiblecity.latitude = dto.latitude;
  //   if (dto.longitude !== undefined) accessiblecity.longitude = dto.longitude;
  //   if (dto.displayOrder !== undefined) accessiblecity.display_order = dto.displayOrder;
  //   if (dto.pictureUrl !== undefined) accessiblecity.picture_url = dto.pictureUrl;

  //   accessiblecity.modified_by = userId;
  //   await this.accessiblecityrepo.save(accessiblecity);
  //   const oldBusinesses = await this.businessRepo.find({
  //     where: { accessible_city_id: id }
  //   });
  //   for (const b of oldBusinesses) {
  //     b.accessible_city_id = null;
  //   }
  //   await this.businessRepo.save(oldBusinesses);
  //   if (dto.business_Ids?.length) {
  //     const businesses = await this.businessRepo.findBy({ id: In(dto.business_Ids) });
  //     if (businesses.length !== dto.business_Ids.length) {
  //       throw new BadRequestException('One or more business IDs are invalid');
  //     }
  //     for (const b of businesses) {
  //       b.accessible_city_id = id;
  //     }
  //     await this.businessRepo.save(businesses);
  //   }
  //   return accessiblecity;
  // }

  async updateAccessibleCity(id: string, userId: string, dto: any) {
  const accessiblecity = await this.accessiblecityrepo.findOne({ where: { id } });
  if (!accessiblecity) {
    throw new NotFoundException('Accessible City not found');
  }

  // --- update city fields ---
  if (dto.cityName && dto.cityName.trim() !== '') {
    accessiblecity.city_name = dto.cityName;
    accessiblecity.slug = this.makeSlug(dto.cityName);
  }

  if (dto.featured !== undefined) accessiblecity.featured = dto.featured;
  if (dto.latitude !== undefined) accessiblecity.latitude = dto.latitude;
  if (dto.longitude !== undefined) accessiblecity.longitude = dto.longitude;
  if (dto.displayOrder !== undefined) accessiblecity.display_order = dto.displayOrder;
  if (dto.pictureUrl !== undefined) accessiblecity.picture_url = dto.pictureUrl;

  accessiblecity.modified_by = userId;
  await this.accessiblecityrepo.save(accessiblecity);

  // ✅ IMPORTANT:
  // Only change business links if business_Ids is provided in request
  if (dto.business_Ids !== undefined) {
    // 1) unlink all currently linked businesses
    const oldBusinesses = await this.businessRepo.find({
      where: { accessible_city_id: id },
    });

    for (const b of oldBusinesses) {
      b.accessible_city_id = null;
    }
    await this.businessRepo.save(oldBusinesses);

    // 2) relink new ones (if any)
    if (Array.isArray(dto.business_Ids) && dto.business_Ids.length) {
      const businesses = await this.businessRepo.findBy({
        id: In(dto.business_Ids),
      });

      if (businesses.length !== dto.business_Ids.length) {
        throw new BadRequestException('One or more business IDs are invalid');
      }

      for (const b of businesses) {
        b.accessible_city_id = id;
      }
      await this.businessRepo.save(businesses);
    }
  }

  return accessiblecity;
}



  async deleteAccessibleCity(id: string, userId: string) {
    const accessiblecity = await this.accessiblecityrepo.findOne({ where: { id } });
    if (!accessiblecity) {
      throw new NotFoundException('Accessible City not found');
    }
    const linkedBusinesses = await this.businessRepo.find({ where: { accessible_city_id: id } });
    for (const b of linkedBusinesses) {
      b.accessible_city_id = null;
    }
    await this.businessRepo.save(linkedBusinesses);
    accessiblecity.modified_by = userId;
    await this.accessiblecityrepo.remove(accessiblecity);
    return { message: 'Accessibility City deleted successfully' }
  }

  async listPaginated(
  page = 1,
  limit = 10,
  opts?: { search?: string; featured?: boolean },
) {
  const qb = this.accessiblecityrepo
    .createQueryBuilder('c')
    .leftJoin(
      'business',
      'b',
      `LOWER(TRIM(b.city)) = LOWER(TRIM(c.city_name))`, 
    )
    .select([
      'c.id',
      'c.city_name',
      'c.picture_url',
      'c.featured',
      'c.display_order',
      'c.slug',
      'c.latitude',
      'c.longitude',
      'c.created_at',
      'c.modified_at',
      'c.external_id',
    ])
    .addSelect('COUNT(b.id)', 'businessCount');

  if (opts?.search?.trim()) {
    qb.andWhere('LOWER(c.city_name) LIKE :search', {
      search: `%${opts.search.trim().toLowerCase()}%`,
    });
  }

  if (opts?.featured !== undefined) {
    qb.andWhere('c.featured = :featured', { featured: opts.featured });
  }

  qb.groupBy('c.id')
    .orderBy('c.display_order', 'ASC')
    .addOrderBy('c.city_name', 'ASC')
    .skip((page - 1) * limit)
    .take(limit);

  // ✅ total count (same filters, no join/group)
  const whereSql =
    qb.expressionMap.wheres.map((w) => w.condition).join(' AND ') || '1=1';

  const [raw, total] = await Promise.all([
    qb.getRawAndEntities(),
    this.accessiblecityrepo
      .createQueryBuilder('c')
      .where(whereSql, qb.getParameters())
      .getCount(),
  ]);

  const items = raw.entities.map((city, idx) => ({
    ...city,
    businessCount: Number(raw.raw[idx]?.businessCount || 0),
  }));

  return {
    items,
    total,
    page,
    limit,
    pageCount: Math.ceil(total / limit),
  };
}

async list1Paginated(page = 1, limit = 10, opts?: { search?: string }) {
  const qb = this.accessiblecityrepo
    .createQueryBuilder('c')
    .leftJoin(
      'business',
      'b',
      `LOWER(TRIM(b.city)) = LOWER(TRIM(c.city_name))`, 
    )
    .select([
      'c.id',
      'c.city_name',
      'c.picture_url',
      'c.featured',
      'c.display_order',
      'c.slug',
      'c.latitude',
      'c.longitude',
      'c.created_at',
      'c.modified_at',
      'c.external_id',
    ])
    .addSelect('COUNT(b.id)', 'businessCount')
    .where('c.featured = :featured', { featured: true }); // ✅ FORCE TRUE

  if (opts?.search?.trim()) {
    qb.andWhere('LOWER(c.city_name) LIKE :search', {
      search: `%${opts.search.trim().toLowerCase()}%`,
    });
  }

  qb.groupBy('c.id')
    .orderBy('c.display_order', 'ASC')
    .addOrderBy('c.city_name', 'ASC')
    .skip((page - 1) * limit)
    .take(limit);

  const [raw, total] = await Promise.all([
    qb.getRawAndEntities(),
    this.accessiblecityrepo
      .createQueryBuilder('c')
      .where('c.featured = :featured', { featured: true }) // ✅ same condition here
      .getCount(),
  ]);

  const items = raw.entities.map((city, idx) => ({
    ...city,
    businessCount: Number(raw.raw[idx]?.businessCount || 0),
  }));

  return {
    items,
    total,
    page,
    limit,
    pageCount: Math.ceil(total / limit),
  };
}



  async getAccessibleCity(
  id: string
) {
  const city = await this.accessiblecityrepo.findOne({ where: { id } });

  if (!city) throw new NotFoundException('Accessible City not found');

  const [businesses, totalBusinesses] = await this.businessRepo.findAndCount({
    where: { accessible_city_id: id,
      business_status: 'Claimed',
     },
    order: { created_at: 'DESC' as any }, 
  });

  return {
    ...city,
    businesses,
    totalBusinesses,
  };
}

}