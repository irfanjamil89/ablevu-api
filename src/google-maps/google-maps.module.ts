import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { GoogleMapsService } from './google-maps.service';
import { GoogleMapsController } from './google-maps.controller';

@Module({
  imports: [
    HttpModule,
    ConfigModule, 
  ],
  controllers: [GoogleMapsController],
  providers: [GoogleMapsService],
  exports: [GoogleMapsService], 
})
export class GoogleMapsModule {}
