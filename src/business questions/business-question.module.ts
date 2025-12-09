import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessQuestions } from 'src/entity/business-questions.entity';
import { BusinessQuestionsService } from './business-question.service';
import {BusinessQuestionsController} from './business-questions.controller'
import { Business } from 'src/entity/business.entity';
import { User } from 'src/entity/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([BusinessQuestions, Business, User])],
  providers: [BusinessQuestionsService],
  controllers: [BusinessQuestionsController],
  exports: [BusinessQuestionsService]
})
export class BusinessQuestionsModule {}
