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
import { AccessibleFeatureType } from 'src/entity/accessible feature-type.entity';
import { AccessibleFeatureService } from 'src/accessible feature/accessible feature.service';
import { BusinessTypeService } from 'src/business-type/business-type.service';
import { AccessibleFeature } from 'src/entity/accessible feature.entity';
import { AccessibleFeatureLinkedType } from 'src/entity/accessible_feature_linked_type.entity';
import { AccessibleFeatureBusinessType } from 'src/entity/accessible_feature_business_type.entity';
import { BusinessType } from 'src/entity/business-type.entity';
import { BusinessRecomendations } from 'src/entity/business_recomendations.entity';
import { GoogleMapsModule } from 'src/google-maps/google-maps.module';
import { ListingsVerified } from 'src/entity/listings-verified.entity';
import { Claims } from 'src/entity/claims.entity';
import { AdditionalResourceModule } from 'src/additional accessiblity resources/additional resource.module';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessType,AccessibleFeatureBusinessType,AccessibleFeatureLinkedType,AccessibleFeature,AccessibleFeatureType,Business, User, BusinessLinkedType, BusinessAccessibleFeature, BusinessVirtualTour, BusinessReviews, BusinessQuestions, BusinessPartners, BusinessCustomSections, BusinessMedia, AccessibleCity, BusinessSchedule,BusinessRecomendations, ListingsVerified,Claims]),
GoogleMapsModule, AdditionalResourceModule
],
  controllers: [SyncbubbleController],
   providers: [SyncService,BusinessService,UsersService,AccessibleFeatureService,BusinessTypeService],
})
export class SyncModule {}
