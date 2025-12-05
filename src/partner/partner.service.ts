import { Injectable, NotFoundException } from "@nestjs/common";
import { In, Repository } from "typeorm";
import { InjectRepository } from '@nestjs/typeorm';
import { Partner } from "src/entity/partner.entity";
import { PartnerDto } from "./partner.dto";
import { BusinessPartners } from "src/entity/business_partners.entity";

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner) private partnerRepo: Repository<Partner>,

    @InjectRepository(BusinessPartners) private businessPartnersRepo: Repository<BusinessPartners>,
  ) { }

  async createPartner(dto: PartnerDto, userId: string) {
    const partner = this.partnerRepo.create({
      name: dto.name,
      description: dto.description,
      tags: dto.tags,
      image_url: dto.image_url,
      web_url: dto.web_url,
      active: dto.active,
      created_by: userId,
      modified_by: userId,
    });
    const savedPartner = await this.partnerRepo.save(partner);
    const businessPartner = this.businessPartnersRepo.create({
      business: { id: dto.business_id },
      partner: savedPartner,
      active: dto.active,
      created_by: userId,
      modified_by: userId,
    });
    await this.businessPartnersRepo.save(businessPartner);

  }
  async updatePartner(id: string, userId: string, dto: PartnerDto) {
    const partner = await this.partnerRepo.findOne({ where: { id } });
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }
    partner.name = dto.name,
      partner.description = dto.description,
      partner.tags = dto.tags,
      partner.image_url = dto.image_url,
      partner.web_url = dto.web_url,
      partner.active = dto.active,
      partner.modified_by = userId,
      await this.partnerRepo.save(partner);

    const businessPartner = await this.businessPartnersRepo.findOne({ 
      where: {
       partner: { id }, 
       business: { id: dto.business_id }
      }
      });
    if (businessPartner) {
      businessPartner.active = dto.active;
      businessPartner.modified_by = userId;
      await this.businessPartnersRepo.save(businessPartner);
    }
  }

  async deletePartner(id: string, userId:string) {
    const Partner = await this.partnerRepo.findOne({ where: { id } });
    if (!Partner) {
      throw new NotFoundException('Partner not found');
    }
    await this.businessPartnersRepo.delete({ partner: { id } });
    await this.partnerRepo.remove(Partner);
  }

  async getPartner(id: string) {
    const Partner = await this.partnerRepo.findOne({ where: { id } });
    if (!Partner) {
      throw new NotFoundException('Accessible Feature not found');
    }
    const linkedTypes = await this.businessPartnersRepo.find({
      where: { partner: { id } },
    });
    return { Partner, linkedTypes };
  }

  async getPaginatedList(page = 1,
    limit = 10,
    opts?: { search?: string; active?: boolean },
  ) {
    const qb = this.partnerRepo.createQueryBuilder('pt')
    if (opts?.search) {
      qb.andWhere('pt.name ILIKE :search', { search: `%${opts.search}%` });
    }
    if (opts?.active !== undefined) {
      qb.andWhere('pt.active = :active', { active: opts.active });
    }

    const total = await qb.getCount();
    const items = await qb
      .orderBy('pt.created_at', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
      
    const itemsWithLinkedTypes = await Promise.all(
      items.map(async (partner) => {
        const linkedTypes = await this.businessPartnersRepo.find({
          where: { partner: { id: partner.id } },
        });
        return { ...partner, linkedTypes };
      }),
    );

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: itemsWithLinkedTypes,
    };
  }
}