import { Controller, Post, Param, Body, Patch, Delete, Query, Get} from "@nestjs/common";
import { CreateBusinessReviewsDto } from "./create-business-reviews.dto";
import { UpdateBusinessReviewsDto } from "./update-business-reviews.dto";
import { BusinessReviewsService } from "./business-reviews.service";

@Controller('business-reviews')
export class BusinessReviewsController{
    constructor(
        private readonly businessReviewsService: BusinessReviewsService,
    ){}

    @Post('create/:UserId')
        async createBusinessReviews(
          @Param('UserId') userId: string,
          @Body() dto: CreateBusinessReviewsDto,
        ) {
          await this.businessReviewsService.createBusinessReviews(userId, dto);
          return { message: 'Business Review created successfully' };
        }

    @Patch('update/:id/:userId')
        async updateBusinessReviews(
          @Param('id') Id: string, 
          @Param('userId') userId: string,
          @Body() dto: UpdateBusinessReviewsDto, 
        ) {
          await this.businessReviewsService.updateBusinessReviews(Id,userId, dto);
          return { message: 'Business Review updated successfully' };
      }

    @Delete('delete/:id/:userId')
          async deleteBusinessReviews(
            @Param('id') Id: string,
            @Param('userId') userId: string,
        ) {
            await this.businessReviewsService.deleteBusinessReviews(Id,userId);
            return{ message: 'Business Review deleted successfully'}
          }

    @Get('list')
  async listPaginated(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('businessId') businessId?: string,
    @Query('reviewTypeId') reviewTypeId?: string,
    @Query('approved') approved?: string,
    @Query('active') active?: string,
    @Query('search') search?: string,
  ) {
    const toBool = (val?: string) =>
      val === undefined ? undefined : val === 'true';

    return this.businessReviewsService.listPaginated(
      Number(page),
      Number(limit),
      {
        businessId,
        reviewTypeId,
        approved: toBool(approved),
        active: toBool(active),
        search,
      },
    );
  }

  @Get('business-reviews-profile/:id')
    async getBusinessReviewProfile(
    @Param('id') Id: string) {
    return this.businessReviewsService.getBusinessReviewProfile(Id);
  }

    
}