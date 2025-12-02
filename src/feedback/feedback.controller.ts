import { Controller, Post, Param, Body, Patch, Delete, Query, Get, UseGuards} from "@nestjs/common";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { FeedbackService } from "./feedback.service";
import { CreateFeedbackDto } from "./create-feedback.dto";
import { UpdateFeedbackDto } from "./update-feedback.dto";

@Controller('feedback')
export class FeedbackController{
    constructor(
        private readonly feedbackService: FeedbackService,
    ){}

    @Post('create')
    @UseGuards(JwtAuthGuard)
        async createFeedback(
          @UserSession() user : any,
          @Body() dto: CreateFeedbackDto,
        ) {
          await this.feedbackService.createFeedback(user.id, dto);
          return { message: 'Feedback created successfully' };
        }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
        async updateFeedback(
          @Param('id') Id: string, 
          @UserSession() user : any,
          @Body() dto: UpdateFeedbackDto, 
        ) {
          await this.feedbackService.updateFeedback(Id,user.id, dto);
          return { message: 'Feedback updated successfully' };
      }

    @UseGuards(JwtAuthGuard)
    @Delete('delete/:id')
    async deleteFeedback(
    @Param('id') Id: string,
    @UserSession() user: any,
    ) {
    await this.feedbackService.deleteFeedback(Id, user.id);
    return { message: 'Feedback deleted successfully' };
    }

    @Get('list')
  async listPaginated(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('businessId') businessId?: string,
    @Query('feedbackTypeId') feedbackTypeId?: string,
    @Query('active') active?: string,
    @Query('search') search?: string,
  ) {
    const toBool = (val?: string) =>
      val === undefined ? undefined : val === 'true';

    return this.feedbackService.listPaginated(
      Number(page),
      Number(limit),
      {
        businessId,
        feedbackTypeId,
        active: toBool(active),
        search,
      },
    );
  }

  @Get('feedback-profile/:id')
    async getFeedbackProfile(
    @Param('id') Id: string) {
    return this.feedbackService.getFeedbackProfile(Id);
  }

    
}