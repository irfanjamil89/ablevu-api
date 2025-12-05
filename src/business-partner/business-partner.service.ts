import { Injectable, NotFoundException } from "@nestjs/common";
import { In, Repository } from "typeorm";
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessPartnerDto } from "./business-partner.dto";
import { BusinessPartners } from "src/entity/business_partners.entity";

@Injectable()
export class BusinessPartnerService {
    constructor(
        @InjectRepository(BusinessPartners) private businessPartnersRepo: Repository<BusinessPartners>
    ) { }

    async createBusinessPartner(dto: BusinessPartnerDto, id: string, userId: string) {
        const businessPartner = this.businessPartnersRepo.create({
            business: { id: id }, 
            partner: { id: dto.partner_id }, 
            created_by: userId
        });
        await this.businessPartnersRepo.save(businessPartner);
    }

    async deleteBusinessPartner(id: string, userId: string) {
        await this.businessPartnersRepo.delete({ partner: { id: id } });
    }
}