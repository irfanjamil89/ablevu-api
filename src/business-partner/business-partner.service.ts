import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
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
        const existing = await this.businessPartnersRepo.findOne({
            where: {
                business: { id: id },
                partner: { id: dto.partner_id }
            }
        });

        if (existing) {
            throw new BadRequestException("This partner is already linked with this business");
        }
        const businessPartner = this.businessPartnersRepo.create({
            business: { id: id },
            partner: { id: dto.partner_id },
            created_by: userId
        });
        await this.businessPartnersRepo.save(businessPartner);
    }

    async deleteBusinessPartner(dto: BusinessPartnerDto, id: string, userId: string) {
        if (!dto.partner_id) {
            throw new BadRequestException("partner_id is required");
        }
        await this.businessPartnersRepo.delete({
            business: { id: id },
            partner: { id: dto.partner_id },
        });
    }
}