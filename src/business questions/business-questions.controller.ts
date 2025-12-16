import { Controller, Param, Post, Body, Patch, Delete, Get, Query, UseGuards } from "@nestjs/common";
import { CreateBusinessQuestionsDto } from "./create-business-questions.dto";
import { UpdateBusinessQuestionsDto } from "./update-business-questions.dto";
import { BusinessQuestionsService } from "./business-question.service";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller('business-questions')
export class BusinessQuestionsController{
    constructor(
        private readonly questionsservice: BusinessQuestionsService,
    ) {}

    @Post('create')
    @UseGuards(JwtAuthGuard)
        async createBusinessQuestions(
            @UserSession() user : any,
            @Body() dto: CreateBusinessQuestionsDto,
        ) {
              await this.questionsservice.createBusinessQuestions(user.id, dto);
              return { message: 'Business Question created successfully' };
        }
    
    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
            async updateBusinessQuestions(
              @Param('id') Id: string, 
              @UserSession() user : any,
              @Body() dto: UpdateBusinessQuestionsDto, 
            ) {
              await this.questionsservice.updateBusinessQuestions(Id,user.id, dto);
              return { message: 'Business Question updated successfully' };
          }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
            async deleteBusinessQuestions(
             @Param('id') Id: string,
             @UserSession() user : any,
        ) {
                await this.questionsservice.deleteBusinessQuestions(Id,user.id);
                return{ message: 'Business Questions deleted successfully'}
        }
    
    @Get('list')
    @UseGuards(JwtAuthGuard)
    async listpaginated(
        @Query('page') page='1',
        @Query('limit') limit='10',
        @Query('businessId') businessId: string,
        @Query('active') active: string,
        @UserSession() user : any,

    ){
    const activeBool =
    active === undefined ? undefined : active === 'true';

      return this.questionsservice.listpaginated(
        Number(page),
        Number(limit),
        {
            businessId,
            active: activeBool,
            userId: user.id,
            userRole: user.user_role,
        }
      )
    }

    @Get('business-questions-profile/:id')
    async getBusinessQuestionsProfile(
    @Param('id') Id: string) {
    return this.questionsservice.getBusinessQuestionsProfile(Id);
  }

}