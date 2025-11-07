import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from 'src/entity/business.entity';
import { CreateBusinessDto } from './create-business.dto';
import { UpdateBusinessDto } from './update-business.dto';
import { User } from 'src/entity/user.entity';

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

) {}

  private makeSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async createBusiness(UserId: string, dto: CreateBusinessDto) {
    const user = await this.userRepo.findOne({ where: { id: UserId } });
    if (!user) throw new NotFoundException('user not found');

     if (!dto.name?.trim()) {
      throw new BadRequestException('Business name is required');
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
    return await this.businessRepo.save(business);
  }

  async updateBusiness(id: string, dto: UpdateBusinessDto) {
    const business = await this.businessRepo.findOne({ where: { id } });
    if (!business){ 
      throw new NotFoundException('Business not found');
    }
    if (dto.name && dto.name.trim() !== '') {
      business.name = dto.name;
      business.slug = this.makeSlug(dto.name);
    }
    Object.assign(business, dto);
    return await this.businessRepo.save(business);
  }

  async deleteBusiness(id: string) {
    const business = await this.businessRepo.findOne({ where: { id } });
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    await this.businessRepo.remove(business);
    return{ message: 'Business deleted successfully'}
  }

  async listPaginated(
    page = 1,
    limit = 10,
    filters: ListFilters = {},
  ) {
    const qb = this.businessRepo.createQueryBuilder('b').leftJoinAndSelect('b.businessTypes', 'bt');;

    qb.take(limit)
      .skip((page - 1) * limit)
      .orderBy('b.created_at', 'DESC');

    if (filters.businessTypeId) {
  qb.andWhere('bt.id = :btId', { btId: filters.businessTypeId });
}

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


