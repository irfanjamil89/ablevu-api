import { Module } from "@nestjs/common";
import { BusinessService } from "./business.service";
import { BusinessController } from "./business.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Business } from "src/entity/business.entity";
import { User } from "src/entity/user.entity";
import { BusinessLinkedType } from "src/entity/business_linked_type.entity";
import { BusinessAccessibleFeature } from "src/entity/business_accessiblity_feature.entity";
import { BusinessVirtualTour } from "src/entity/business_virtual_tours.entity";
import { BusinessReviews } from "src/entity/business_reviews.entity";
import { BusinessQuestions } from "src/entity/business-questions.entity";
import { BusinessPartners } from "src/entity/business_partners.entity";
import { BusinessCustomSections } from "src/entity/business_custom_sections.entity";
import { BusinessMedia } from "src/entity/business_media.entity";
import { BusinessSchedule } from "src/entity/business_schedule.entity";
@Module({
    imports: [TypeOrmModule.forFeature([Business, User, BusinessLinkedType, BusinessAccessibleFeature,
         BusinessVirtualTour, BusinessReviews, BusinessQuestions, BusinessPartners,
          BusinessCustomSections, BusinessMedia, BusinessSchedule])],
    providers: [BusinessService],
    controllers: [BusinessController],
    exports: [BusinessService],
})
export class BusinessModule {}