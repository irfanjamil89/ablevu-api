import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessReviews } from 'src/entity/business_reviews.entity';
import { BusinessReviewsController } from './business-reviews.controller';
import { BusinessReviewsService } from './business-reviews.service';
import { Business } from 'src/entity/business.entity';
import { ReviewType } from 'src/entity/review_type.entity';
import { User } from 'src/entity/user.entity';


@Module({
  imports: [TypeOrmModule.forFeature([BusinessReviews, Business,ReviewType, User ])],
  controllers: [BusinessReviewsController],
  providers: [BusinessReviewsService],
  exports: [BusinessReviewsService],
})
export class BusinessReviewsModule {}
