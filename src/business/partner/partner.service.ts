import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from "src/entity/business.entity";
import { PartnerDto } from "./partner.dto";

@Injectable()
export class PartnerService {
    constructor(
    @InjectRepository(Business) private readonly businessrepository: Repository<Business>,
    ) {}
    async createPartner( dto: PartnerDto, partnerID: string) {
        const Partner = await this.businessrepository.findOne({ where: { id: partnerID } });
        if (!Partner) throw new NotFoundException('ID not found');
        Partner.partner_name = dto.Partner_Name;
        Partner.partner_website = dto.Website;
        Partner.partner_contact_person = dto.Contact_Person;
        await this.businessrepository.save(Partner);
      }
}