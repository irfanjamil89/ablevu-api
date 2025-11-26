import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessVirtualTour } from '../entity/business_virtual_tours.entity';
import { BusinessVirtualTourService } from './business-virtual-tour.service';
import { BusinessVirtualTourController } from './business-virtual-tour.controller';
import { Business } from 'src/entity/business.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessVirtualTour, Business])],
  controllers: [BusinessVirtualTourController],
  providers: [BusinessVirtualTourService],
  exports: [BusinessVirtualTourService],
})
export class BusinessVirtualTourModule {}
