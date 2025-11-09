import {} from '@nestjs/common';
import { Module } from '@nestjs/common';
import { AccessibleFeatureService } from './accessible feature.service';
import { AccessibleFeatureController  } from './accessible feature.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessibleFeature } from 'src/entity/accessible feature.entity';
import { AccessibleFeatureLinkedType } from 'src/entity/accessible_feature_linked_type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AccessibleFeature, AccessibleFeatureLinkedType])],
    providers: [AccessibleFeatureService],   
    controllers: [AccessibleFeatureController ],
    exports: [AccessibleFeatureService],
})
export class AccessibleFeatureModule {}
