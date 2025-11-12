import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AppService } from 'src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/services/user.service';
import { User } from 'src/entity/user.entity';
import { ImagesController } from './image.controller';
import { S3Service } from 'src/services/s3service';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
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
