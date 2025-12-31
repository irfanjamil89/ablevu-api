import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessAudioTour } from '../entity/business_audio_tour.entity';
import { BusinessAudioTourService } from './business-audio-tour.service';
import { BusinessAudioTourController } from './business-audio-tour.controller';
import { Business } from 'src/entity/business.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessAudioTour, Business]),
  ],
  controllers: [
    BusinessAudioTourController,
  ],
  providers: [
    BusinessAudioTourService,
  ],
  exports: [BusinessAudioTourService],
})
export class BusinessAudioTourModule {}