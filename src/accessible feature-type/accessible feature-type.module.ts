import {} from '@nestjs/common';
import { Module } from '@nestjs/common';
import { AccessibleFeatureTypeService } from './accessible feature-type.service';
import { AccessibleFeatureTypeController  } from './accessible feature-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessibleFeatureType } from 'src/entity/accessible feature-type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AccessibleFeatureType])],
    providers: [AccessibleFeatureTypeService],   
    controllers: [AccessibleFeatureTypeController ],
    exports: [AccessibleFeatureTypeService],
})
export class AccessibleFeatureTypeModule {}
