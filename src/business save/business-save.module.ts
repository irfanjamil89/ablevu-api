import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessSave } from 'src/entity/business_save.entity';
import { BusinessSaveService } from './business-save.service';
import { BusinessSaveController } from './business-save.controller';
import { Business } from 'src/entity/business.entity';
import { User } from 'src/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessSave, Business, User])],
  providers: [BusinessSaveService],
  controllers: [BusinessSaveController],
})
export class BusinessSaveModule {}
