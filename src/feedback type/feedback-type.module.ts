import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackTypeController } from './feedback-type.controller';
import { FeedbackType } from 'src/entity/feedback-type.entity';
import { FeedbackTypeService } from './feedback-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeedbackType])],
  controllers: [FeedbackTypeController],
  providers: [FeedbackTypeService],
  exports: [FeedbackTypeService],
})
export class FeedbackTypeModule {}
