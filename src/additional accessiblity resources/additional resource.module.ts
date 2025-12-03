import { Module } from '@nestjs/common';
import { AdditionalResourceService } from './additional resource.service';
import { AdditionalResourceController } from './additional resource.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdditionalResource } from 'src/entity/additional resource.entity';
@Module({
  imports: [TypeOrmModule.forFeature([AdditionalResource])],
  providers: [AdditionalResourceService],
  controllers: [AdditionalResourceController],
  exports: [TypeOrmModule, AdditionalResourceService], // 👈 export repository
})
export class AdditionalResourceModule {}