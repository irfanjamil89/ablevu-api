import { Controller,Post, Param, Body, Patch, Delete, Query, Get, UseGuards } from "@nestjs/common";
import { CreateFeedbackTypeDto } from "./create-feedback-type.dto";
import { UpdateFeedbackTypeDto } from "./update-feedback-type.dto";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { FeedbackTypeService } from "./feedback-type.service";

@Controller('feedback-type')
export class FeedbackTypeController{
    constructor(
        private readonly feedbackTypeService: FeedbackTypeService,
    ){}

    @Post('create')
    @UseGuards(JwtAuthGuard)
        async createFeedbackType(
          @UserSession() user : any,
          @Body() dto: CreateFeedbackTypeDto,
        ) {
          await this.feedbackTypeService.createFeedbackType(user.id, dto);
          return { message: 'Feedback Type created successfully' };
        }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
        async updateFeedbackType(
          @Param('id') Id: string, 
          @UserSession() user : any,
          @Body() dto: UpdateFeedbackTypeDto, 
        ) {
          await this.feedbackTypeService.updateFeedbackType(Id, user.id, dto);
          return { message: 'Feedback Type updated successfully' };
      }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
      async deleteFeedbackType(
        @Param('id') Id: string,
        @UserSession() user : any,
    ) {
        await this.feedbackTypeService.deleteFeedbackType(Id, user.id);
        return{ message: 'Feedback Type deleted successfully'}
      }

    @Get('list')
    async listPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('active') active?: string,
  ) {
    const activeBool =
      active === undefined ? undefined : active === 'true' ? true : false;

    return this.feedbackTypeService.listPaginated(
      Number(page),
      Number(limit),
      search,
      activeBool,
    );
  }

  @Get('feedback-type-profile/:id')
    async getFeedbackTypeProfile(
    @Param('id') Id: string) {
    return this.feedbackTypeService.getFeedbackTypeProfile(Id);
  }
}