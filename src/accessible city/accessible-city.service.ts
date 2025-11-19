import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessibleCity } from '../entity/accessible_city.entity';
import { CreateAccessibleCityDto } from './create-accessible-city.dto';
import { User } from 'src/entity/user.entity';

@Injectable()
export class AccessibleCityService {
  constructor(
    @InjectRepository(AccessibleCity)
    private readonly accessiblecityrepo: Repository<AccessibleCity>,
     @InjectRepository(User)
      private readonly userRepo: Repository<User>,
  ) {}

  private makeSlug(name: string) {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
  
    async createAccessibleCity(UserId: string, dto: CreateAccessibleCityDto) {
      const user = await this.userRepo.findOne({ where: { id: UserId } });
      if (!user) throw new NotFoundException('user not found');
  
       if (!dto.cityName?.trim()) {
        throw new BadRequestException('City name is required');
      }
     
      const slug = this.makeSlug(dto.cityName);

       const existing = await this.accessiblecityrepo.findOne({
      where: [{ city_name: dto.cityName }, { slug }],
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
      });
      return await this.accessiblecityrepo.save(city);
    }

    async updateAccessibleCity(id: string, userId: string, dto: any) {
    const accessiblecity = await this.accessiblecityrepo.findOne({ where: { id } });
    if (!accessiblecity){ 
      throw new NotFoundException('Accessible City Type not found');
  }   
    if (dto.cityName && dto.cityName.trim() !== '') {
      accessiblecity.city_name = dto.cityName;
      accessiblecity.slug = this.makeSlug(dto.cityName);
  }
    if (dto.featured !== undefined) accessiblecity.featured = dto.featured;
    if (dto.latitude !== undefined) accessiblecity.latitude = dto.latitude;
    if (dto.longitude !== undefined) accessiblecity.longitude = dto.longitude;
    if (dto.displayOrder !== undefined) accessiblecity.display_order = dto.displayOrder;
    if (dto.pictureUrl !== undefined) accessiblecity.picture_url = dto.picture_url;

    accessiblecity.modified_by = userId;
    Object.assign(accessiblecity, dto);
    return await this.accessiblecityrepo.save(accessiblecity);
  }

  async deleteAccessibleCity(id: string, userId: string) {
    const accessiblecity = await this.accessiblecityrepo.findOne({ where: { id } });
    if (!accessiblecity){ 
      throw new NotFoundException('Accessible City not found');
  }   
    accessiblecity.modified_by = userId;
    await this.accessiblecityrepo.remove(accessiblecity);
    return{ message: 'Accessibility City deleted successfully'}
  }

  async listPaginated(
  page = 1,
  limit = 10,
  opts?: { search?: string; featured?: boolean },
) {
  const qb = this.accessiblecityrepo
    .createQueryBuilder('c')
    .leftJoinAndSelect('c.businesses', 'b', 'b.active = :active', {
      active: true,
    })
    .loadRelationCountAndMap(
      'c.businessCount',      
      'c.businesses',
      'bc',
      (q) => q.where('bc.active = :active', { active: true }),
    );

  if (opts?.search && opts.search.trim()) {
    const search = `%${opts.search.trim().toLowerCase()}%`;
    qb.andWhere('LOWER(c.city_name) LIKE :search', { search });
  }
  if (opts?.featured !== undefined) {
    qb.andWhere('c.featured = :featured', { featured: opts.featured });
  }

  qb.orderBy('c.display_order', 'ASC')
    .addOrderBy('c.city_name', 'ASC')
    .skip((page - 1) * limit)
    .take(limit);

  const [items, total] = await qb.getManyAndCount();

  return {
    items,          
    total,
    page,
    limit,
    pageCount: Math.ceil(total / limit),
  };
}
  async getAccessibleCity(id: string) {
  const accessiblecity = await this.accessiblecityrepo.findOne({
    where: { id },
    relations: {
      businesses: true,   
    },
  });
  if (!accessiblecity) {
    throw new NotFoundException('Accessible City not found');
  }
  (accessiblecity as any).businessCount = accessiblecity.businesses.length;

  return accessiblecity;
}

}