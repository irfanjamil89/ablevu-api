import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessQuestions } from 'src/entity/business-questions.entity';
import { BusinessQuestionsService } from './business-question.service';
import {BusinessQuestionsController} from './business-questions.controller'
import { Business } from 'src/entity/business.entity';
import { User } from 'src/entity/user.entity';
import { NotificationModule } from 'src/notifications/notifications.module';
@Module({
  imports: [TypeOrmModule.forFeature([BusinessQuestions, Business, User]), NotificationModule],
  providers: [BusinessQuestionsService],
  controllers: [BusinessQuestionsController],
  exports: [BusinessQuestionsService]
})
export class BusinessQuestionsModule {}
