// src/audio/audio.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudioController } from './audio.controller';
import { S3Module } from '../services/s3.module';
import { BusinessAudioTour } from '../entity/business_audio_tour.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessAudioTour]), // Register the repository
    S3Module,
  ],
  controllers: [AudioController],
})
export class AudioModule {}