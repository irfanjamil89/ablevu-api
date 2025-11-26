import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessSchedule } from 'src/entity/business_schedule.entity';
import { Business } from 'src/entity/business.entity';
import { BusinessScheduleService } from './business-schedule.service';
import { BusinessScheduleController } from './business-schedule.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessSchedule, Business])],
  controllers: [BusinessScheduleController],
  providers: [BusinessScheduleService],
  exports: [BusinessScheduleService],
})

export class BusinessScheduleModule {}
