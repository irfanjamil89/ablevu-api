import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessMedia } from 'src/entity/business_media.entity';
import { Business } from 'src/entity/business.entity';
import { BusinessMediaController } from './business-media.controller';
import { BusinessMediaService } from './business-media.service';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessMedia, Business])],
  providers: [BusinessMediaService],
  controllers: [BusinessMediaController],
  exports: [BusinessMediaService]
})
export class BusinessMediaModule {}
