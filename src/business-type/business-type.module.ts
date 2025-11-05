import {} from '@nestjs/common';
import { Module } from '@nestjs/common';
import { BusinessTypeService } from './business-type.service';
import { BusinessTypeController } from './business-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessType } from 'src/entity/business-type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([BusinessType])],
    providers: [BusinessTypeService],   
    controllers: [BusinessTypeController],
    exports: [BusinessTypeService],
})
export class BusinessTypeModule {}