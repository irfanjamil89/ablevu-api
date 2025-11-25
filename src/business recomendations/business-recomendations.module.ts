import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessRecomendations } from 'src/entity/business_recomendations.entity';
import { Business } from 'src/entity/business.entity';
import { BusinessRecomendationsController } from './business-recomendations.controller';
import { BusinessRecomendationsService } from './business-recomendations.service';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessRecomendations, Business])],
  controllers: [BusinessRecomendationsController],
  providers: [BusinessRecomendationsService],
  exports: [BusinessRecomendationsService],
})

export class BusinessRecomendationsModule {}
