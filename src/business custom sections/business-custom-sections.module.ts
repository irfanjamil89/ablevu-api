import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessCustomSections } from 'src/entity/business_custom_sections.entity';
import { Business } from 'src/entity/business.entity';
import { BusinessCustomSectionsController } from './business-custom-sections.controller';
import { BusinessCustomSectionsService } from './business-custom-sections.service';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessCustomSections, Business])],
  providers: [BusinessCustomSectionsService],
  controllers: [BusinessCustomSectionsController],
  exports: [BusinessCustomSectionsService]
})
export class BusinessCustomSectionsModule {}
