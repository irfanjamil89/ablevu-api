import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessAccessibleFeature } from 'src/entity/business_accessiblity_feature.entity';
import { Business } from 'src/entity/business.entity';
import { AccessibleFeature } from 'src/entity/accessible_feature.entity';
import { BusinessAccessibleFeatureService } from './business-accessible-feature.service';
import { BusinessAccessibleFeatureController } from './business-accessible-feature.controller';
import { SyncModule } from 'src/sync/sync.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessAccessibleFeature,
      Business,
      AccessibleFeature,
    ]),
    forwardRef(() => SyncModule),
  ],
  controllers: [BusinessAccessibleFeatureController],
  providers: [BusinessAccessibleFeatureService],
  exports: [BusinessAccessibleFeatureService],
})
export class BusinessAccessibleFeatureModule {}
