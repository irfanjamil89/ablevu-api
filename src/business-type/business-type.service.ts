import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessType } from 'src/entity/business-type.entity';

@Injectable()
export class BusinessTypeService {
  constructor(
    @InjectRepository(BusinessType)
    private readonly businessTypeRepo: Repository<BusinessType>,
  ) {}

  private makeSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async createBusinessType(userId: string, dto: any) {
    if (!dto.name || dto.name.trim() === '') {
    throw new BadRequestException('Business Type name is missing');
    }
    const slug = this.makeSlug(dto.name);

    const businessType = this.businessTypeRepo.create({
      name: dto.name,
      picture_url: dto.picture_url ?? null,
      display_order: dto.display_order ?? null,
      active: dto.active ?? true,
      slug,
      created_by: userId,
      modified_by: userId,
  });

    return await this.businessTypeRepo.save(businessType);
  }

  async updateBusinessType(id: string, userId: string, dto: any) {
    const businessType = await this.businessTypeRepo.findOne({ where: { id } });
    if (!businessType){ 
      throw new NotFoundException('Business Type not found');
  }   
    if (dto.name && dto.name.trim() !== '') {
      businessType.name = dto.name;
      businessType.slug = this.makeSlug(dto.name);
  }
    if (dto.picture_url !== undefined) businessType.picture_url = dto.picture_url;
    if (dto.display_order !== undefined) businessType.display_order = dto.display_order;
    if (dto.active !== undefined) businessType.active = dto.active;

    businessType.modified_by = userId;
    Object.assign(businessType, dto);
    return await this.businessTypeRepo.save(businessType);
  }

  async deleteBusinessType(id: string, userId: string) {
    const businessType = await this.businessTypeRepo.findOne({ where: { id } });
    if (!businessType){ 
      throw new NotFoundException('Business Type not found');
    }   
    businessType.modified_by = userId;
    await this.businessTypeRepo.remove(businessType);
    return{ message: 'Business Type deleted successfully'}
  }

  async listPaginated(page = 1, limit = 10, opts?: { search?: string; active?: boolean }) {
    const qb = this.businessTypeRepo
    .createQueryBuilder('bt')
    .where('1=1');

    if (opts?.search) {
      qb.andWhere('bt.name ILIKE :search', { search: `%${opts.search}%` });
  }

    if (opts?.active !== undefined) {
      qb.andWhere('bt.active = :active', { active: opts.active });
  }

    const total = await qb.getCount();
    const data = await qb
    .orderBy('bt.display_order', 'ASC')
    .addOrderBy('bt.name', 'ASC')
    .skip((page - 1) * limit) 
    .take(limit)              
    .getMany();

    return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data,
  };
}

  async getBusinessType(id: string) {
    const businessType = await this.businessTypeRepo.findOne({ where: { id } });  
    if (!businessType) {
      throw new NotFoundException('Business not found');
    }
    return businessType;
  } 
}  