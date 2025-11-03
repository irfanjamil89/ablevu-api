import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from 'src/entity/business.entity';
import { User } from 'src/entity/user.entity';
import { CreateBusinessDto } from './create-business.dto';
import { UpdateBusinessDto } from './update-business.dto';

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

  async createBusinessForUser(userId: string, dto: CreateBusinessDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!dto.name || dto.name.trim() === '') {
    throw new BadRequestException('Business name is missing');
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

  async getAllBusinessesForUser(userId: string) {
    const businesses = await this.businessRepo.find({
       where: { ownerUserId: userId },
      select: ['id', 'name'],      
      });
    return businesses;
  }
  
  async getBusinessProfile(id: string) {
    const business = await this.businessRepo.findOne({ where: { id } });  
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return business;
  }
}


