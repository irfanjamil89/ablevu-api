import { Controller, Param, Post, Body, Patch, Delete, Get, Query } from "@nestjs/common";
import { CreateBusinessQuestionsDto } from "./create-business-questions.dto";
import { UpdateBusinessQuestionsDto } from "./update-business-questions.dto";
import { BusinessQuestionsService } from "./business-question.service";

@Controller('business-questions')
export class BusinessQuestionsController{
    constructor(
        private readonly questionsservice: BusinessQuestionsService,
    ) {}

    @Post('create/:UserId')
        async createBusinessQuestions(
            @Param('UserId') userId: string,
            @Body() dto: CreateBusinessQuestionsDto,
        ) {
              await this.questionsservice.createBusinessQuestions(userId, dto);
              return { message: 'Business Question created successfully' };
        }
    
    @Patch('update/:id/:userId')
            async updateBusinessQuestions(
              @Param('id') Id: string, 
              @Param('userId') userId: string,
              @Body() dto: UpdateBusinessQuestionsDto, 
            ) {
              await this.questionsservice.updateBusinessQuestions(Id,userId, dto);
              return { message: 'Business Question updated successfully' };
          }

    @Delete('delete/:id/:userId')
            async deleteBusinessQuestions(
             @Param('id') Id: string,
             @Param('userId') userId: string,
        ) {
                await this.questionsservice.deleteBusinessQuestions(Id,userId);
                return{ message: 'Business Questions deleted successfully'}
        }
    
    @Get('list')
    async listpaginated(
        @Query('page') page='1',
        @Query('limit') limit='10',
        @Query('businessId') businessId: string,
        @Query('active') active: string,

    ){
    const activeBool =
    active === undefined ? undefined : active === 'true';

      return this.questionsservice.listpaginated(
        Number(page),
        Number(limit),
        {
            businessId,
            active: activeBool,
        }
      )
    }

    @Get('business-questions-profile/:id')
    async getBusinessQuestionsProfile(
    @Param('id') Id: string) {
    return this.questionsservice.getBusinessQuestionsProfile(Id);
  }

}