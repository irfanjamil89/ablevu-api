import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessAccessibleFeature } from 'src/entity/business_accessiblity_feature.entity';
import { Business } from 'src/entity/business.entity';
import { AccessibleFeature } from 'src/entity/accessible_feature.entity';
import { BusinessAccessibleFeatureService } from './business-accessible-feature.service';
import { BusinessAccessibleFeatureController } from './business-accessible-feature.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessAccessibleFeature,
      Business,
      AccessibleFeature,
    ]),
  ],
  controllers: [BusinessAccessibleFeatureController],
  providers: [BusinessAccessibleFeatureService],
  exports: [BusinessAccessibleFeatureService],
})
export class BusinessAccessibleFeatureModule {}
