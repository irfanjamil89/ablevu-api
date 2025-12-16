import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, configService } from './services/config.service';
import { AuthModule } from './auth/auth.module';
import { AccessibleFeatureTypeModule } from './accessible feature-type/accessible feature-type.module';
import { BusinessModule } from './business/business.module';
import { BusinessTypeModule } from './business-type/business-type.module';
import { AccessibleCityModule } from './accessible city/accessible-city.module';
import { AccessibleFeatureModule } from './accessible feature/accessible feature.module';
import { PartnerModule } from './partner/partner.module';
import { BusinessVirtualTourModule } from 'src/business virtual tour/business-virtual-tour.module'
import { ReviewTypeModule } from './review type/review-type.module';
import { BusinessReviewsModule } from './business reviews/business-reviews.module';
import { BusinessQuestionsModule } from './business questions/business-question.module';
import { UserSession } from './auth/user.decorator';
import { BusinessCustomSectionsModule } from './business custom sections/business-custom-sections.module';
import { BusinessMediaModule } from './business media/business-media.module';
import { BusinessScheduleModule } from './business schedule/business-schedule.module';
import { CouponsModule } from './coupons/coupons.module';
import { AdditionalResourceModule } from './additional accessiblity resources/additional resource.module';

import { BusinessRecomendationsModule } from './business recomendations/business-recomendations.module';
import { SyncModule } from './sync/sync.module';
import { GoogleMapsModule } from './google-maps/google-maps.module';
import { FeedbackTypeModule } from './feedback type/feedback-type.module';
import { FeedbackModule } from './feedback/feedback.module';
import { BusinessPartnerModule } from './business-partner/business-partner.module';
import { BusinessAccessibleFeatureModule } from './business-accessible-feature/business-accessible-feature.module';
import { BusinessImagesModule } from './business images/business-images.module';
import { SubscribeModule } from './subscribe/subscribe.module';
import { ClaimRequestModule } from './claim request/claim-request.module';
import { NotificationModule } from './notifications/notifications.module';
import { EmailModule } from './chatbot-email/email.module';
import { BusinessSaveModule } from './business save/business-save.module';
import { PaymentModule } from './payment/payment.module';
import { StripeService } from './payment/stripe/stripe.service';
@Module({
  imports: [
    //  TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5432,
    //   username: 'postgres',
    //   password: 'irfan',
    //   database: 'ablevue',
    //         //entities: ['**/*.entity{.ts,.js}'],
    //   synchronize: true,
    //   migrationsTableName: 'migration',
    //   migrations: ['src/migration/*.ts'],
      
    // }),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    UserModule,
    AuthModule,
    AccessibleFeatureTypeModule,
    BusinessModule,
    BusinessTypeModule,
    AccessibleCityModule,
    AccessibleFeatureModule,
    PartnerModule,
    BusinessVirtualTourModule,
    AdditionalResourceModule,
    ReviewTypeModule,
    BusinessReviewsModule,
    BusinessQuestionsModule,
    BusinessCustomSectionsModule,
    BusinessMediaModule,
    BusinessScheduleModule,
    CouponsModule,
    BusinessRecomendationsModule,
    SyncModule,
    GoogleMapsModule,
    FeedbackTypeModule,
    FeedbackModule,
    BusinessPartnerModule,
    BusinessAccessibleFeatureModule,
    BusinessImagesModule,
    SubscribeModule,
    ClaimRequestModule,
    NotificationModule,
    EmailModule,
    BusinessSaveModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
