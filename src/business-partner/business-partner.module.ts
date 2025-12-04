import {} from '@nestjs/common';
import { Module } from '@nestjs/common';
import { BusinessPartnerService } from "./business-partner.service";
import { BusinessPartnerController } from './business-partner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessPartners } from 'src/entity/business_partners.entity';

@Module({
    imports: [TypeOrmModule.forFeature([BusinessPartners])],
    providers: [BusinessPartnerService],   
    controllers: [BusinessPartnerController ],
    exports: [BusinessPartnerService],
})
export class BusinessPartnerModule {}