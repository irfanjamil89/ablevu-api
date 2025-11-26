import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewTypeController } from './review-type.controller';
import { ReviewTypeService } from './review-type.service';
import { ReviewType } from 'src/entity/review_type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewType])],
  controllers: [ReviewTypeController],
  providers: [ReviewTypeService],
  exports: [ReviewTypeService],
})
export class ReviewTypeModule {}
