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
import { AccessibleFeature } from 'src/entity/accessible_feature.entity';
import { AccessibleFeatureLinkedType } from 'src/entity/accessible_feature_linked_type.entity';
import { AccessibleFeatureBusinessType } from 'src/entity/accessible_feature_business_type.entity';
import { BusinessType } from 'src/entity/business-type.entity';
import { BusinessRecomendations } from 'src/entity/business_recomendations.entity';
import { GoogleMapsModule } from 'src/google-maps/google-maps.module';
import { ListingsVerified } from 'src/entity/listings-verified.entity';
import { Claims } from 'src/entity/claims.entity';
import { AdditionalResource } from 'src/entity/additional_resource.entity';
import { BusinessImages } from 'src/entity/business_images.entity';
import { BusinessModule } from 'src/business/business.module';
import { NotificationModule } from 'src/notifications/notifications.module';
import { AccessibleCityService } from 'src/accessible city/accessible-city.service';
import { BusinessAudioTour } from 'src/entity/business_audio_tour.entity';
import { BusinessCustomSectionsMedia } from 'src/entity/business-custom-sections-media.entity';
import { Partner } from 'src/entity/partner.entity';
import { Feedback } from 'src/entity/feedback.entity';
import { FeedbackType } from 'src/entity/feedback-type.entity';
import { ReviewType } from 'src/entity/review_type.entity';
import { Coupons } from 'src/entity/coupons.entity';
import { Subscription } from 'src/entity/subscription.entity';
import { S3Service } from 'src/services/s3service';
import { S3Client } from '@aws-sdk/client-s3';
@Module({
  imports: [TypeOrmModule.forFeature([BusinessType,AccessibleFeatureBusinessType,AccessibleFeatureLinkedType,AccessibleFeature,AccessibleFeatureType,Business, User, BusinessLinkedType, BusinessAccessibleFeature, BusinessVirtualTour, BusinessReviews, BusinessQuestions, BusinessPartners, BusinessCustomSections, BusinessMedia, AccessibleCity, BusinessSchedule,BusinessRecomendations,AdditionalResource,BusinessAccessibleFeature,ListingsVerified,Claims, BusinessImages,BusinessAudioTour,BusinessCustomSectionsMedia, Partner, Feedback, FeedbackType, ReviewType, Coupons, Subscription]),
GoogleMapsModule, BusinessModule, NotificationModule
],
  controllers: [SyncbubbleController],
   providers: [
    {
      provide: S3Client,
      useFactory: () =>
        new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        }),
    },
    SyncService,UsersService,AccessibleFeatureService,BusinessTypeService, AccessibleCityService,S3Service],
})
export class SyncModule {}
