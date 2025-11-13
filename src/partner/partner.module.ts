import {} from '@nestjs/common';
import { Module } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from 'src/entity/partner.entity';
import { BusinessPartners } from 'src/entity/business_partners.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Partner, BusinessPartners])],
    providers: [PartnerService],   
    controllers: [PartnerController ],
    exports: [PartnerService],
})
export class PartnerModule {}
