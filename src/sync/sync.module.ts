import { Module } from '@nestjs/common';
import { SyncbubbleController } from './syncbubble.controller';
import { SyncService } from './sync.service';
import { BusinessService } from 'src/business/business.service';
import { UsersService } from 'src/services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from 'src/entity/business.entity';
import { User } from 'src/entity/user.entity';
import { BusinessLinkedType } from 'src/entity/business_linked_type.entity';
import { BusinessAccessibleFeature } from 'src/entity/business_accessiblity_feature.entity';
import { AccessibleCity } from 'src/entity/accessible_city.entity';
import { BusinessQuestions } from 'src/entity/business-questions.entity';
import { BusinessCustomSections } from 'src/entity/business_custom_sections.entity';
import { BusinessMedia } from 'src/entity/business_media.entity';
import { BusinessPartners } from 'src/entity/business_partners.entity';
import { BusinessReviews } from 'src/entity/business_reviews.entity';
import { BusinessSchedule } from 'src/entity/business_schedule.entity';
import { BusinessVirtualTour } from 'src/entity/business_virtual_tours.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Business, User, BusinessLinkedType, BusinessAccessibleFeature, BusinessVirtualTour, BusinessReviews, BusinessQuestions, BusinessPartners, BusinessCustomSections, BusinessMedia, AccessibleCity, BusinessSchedule])],
  controllers: [SyncbubbleController],
   providers: [SyncService,BusinessService,UsersService],
})
export class SyncModule {}
