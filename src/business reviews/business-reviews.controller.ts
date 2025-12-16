import { Controller, Post, Param, Body, Patch, Delete, Query, Get, UseGuards} from "@nestjs/common";
import { CreateBusinessReviewsDto } from "./create-business-reviews.dto";
import { UpdateBusinessReviewsDto } from "./update-business-reviews.dto";
import { BusinessReviewsService } from "./business-reviews.service";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";


@Controller('business-reviews')
export class BusinessReviewsController{
    constructor(
        private readonly businessReviewsService: BusinessReviewsService,
    ){}

    @Post('create')
    @UseGuards(JwtAuthGuard)
        async createBusinessReviews(
          @UserSession() user : any,
          @Body() dto: CreateBusinessReviewsDto,
        ) {
          await this.businessReviewsService.createBusinessReviews(user.id, dto);
          return { message: 'Business Review created successfully' };
        }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
        async updateBusinessReviews(
          @Param('id') Id: string, 
          @UserSession() user : any,
          @Body() dto: UpdateBusinessReviewsDto, 
        ) {
          await this.businessReviewsService.updateBusinessReviews(Id,user.id, dto);
          return { message: 'Business Review updated successfully' };
      }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
          async deleteBusinessReviews(
            @Param('id') Id: string,
            @UserSession() user : any,
        ) {
            await this.businessReviewsService.deleteBusinessReviews(Id,user.id);
            return{ message: 'Business Review deleted successfully'}
          }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async listPaginated(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
     @UserSession() user : any,
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
        userId: user.id,
        userRole: user.user_role,
      },
    );
  }

  @Get('business-reviews-profile/:id')
    async getBusinessReviewProfile(
    @Param('id') Id: string) {
    return this.businessReviewsService.getBusinessReviewProfile(Id);
  }

    
}