import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessImages } from 'src/entity/business_images.entity';
import { Business } from 'src/entity/business.entity';
import { BusinessImagesController } from './business-images.controller';
import { BusinessImagesService } from './business-images.service';
@Module({
  imports: [TypeOrmModule.forFeature([BusinessImages, Business])],
  providers: [BusinessImagesService],
  controllers: [BusinessImagesController],
  exports: [BusinessImagesService]
})
export class BusinessImagesModule {}
