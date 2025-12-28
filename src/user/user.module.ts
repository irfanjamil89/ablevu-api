import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AppService } from 'src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/services/user.service';
import { User } from 'src/entity/user.entity';
import { ImagesController } from './image.controller';
import { S3Service } from 'src/services/s3service';
import { S3Client } from '@aws-sdk/client-s3';
import { Business } from 'src/entity/business.entity';
import { BusinessImages } from 'src/entity/business_images.entity';
import { Partner } from 'src/entity/partner.entity';
import { AccessibleCity } from 'src/entity/accessible_city.entity';
import { NotificationModule } from "src/notifications/notifications.module";
import { BusinessReviews } from 'src/entity/business_reviews.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Business, BusinessImages, Partner, AccessibleCity, BusinessReviews]),NotificationModule],
    controllers: [UserController,ImagesController],
    providers: [AppService,UsersService,S3Service,{
      provide: S3Client,
      useFactory: () =>
        new S3Client({
          region: process.env.AWS_REGION,
          // If running on EC2/ECS/Lambda with role, omit credentials
          credentials: process.env.AWS_ACCESS_KEY_ID
            ? {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
              }
            : undefined,
        }),
    },],
    exports: [UsersService],
})
export class UserModule {}
