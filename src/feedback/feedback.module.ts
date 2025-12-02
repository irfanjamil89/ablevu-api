import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackType } from 'src/entity/feedback-type.entity';
import { Feedback } from 'src/entity/feedback.entity';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';


@Module({
  imports: [TypeOrmModule.forFeature([Feedback, FeedbackType ])],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
