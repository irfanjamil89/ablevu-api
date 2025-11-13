import { Controller,Post, Param, Body, Patch, Delete, Query, Get } from "@nestjs/common";
import { CreateReviewTypeDto } from "./create-review-type.dto";
import { UpdateReviewTypeDto } from "./update-review-type.dto";
import { ReviewTypeService } from "./review-type.service";

@Controller('review-type')
export class ReviewTypeController{
    constructor(
        private readonly reviewTypeService: ReviewTypeService,
    ){}

    @Post('create/:UserId')
        async createReviewType(
          @Param('UserId') userId: string,
          @Body() dto: CreateReviewTypeDto,
        ) {
          await this.reviewTypeService.createReviewType(userId, dto);
          return { message: 'Review Type created successfully' };
        }

    @Patch('update/:id/:userId')
        async updateReviewType(
          @Param('id') Id: string, 
          @Param('userId') userId: string,
          @Body() dto: UpdateReviewTypeDto, 
        ) {
          await this.reviewTypeService.updateReviewType(Id,userId, dto);
          return { message: 'Review Type updated successfully' };
      }

    @Delete('delete/:id/:userId')
      async deleteReviewType(
        @Param('id') Id: string,
        @Param('userId') userId: string,
    ) {
        await this.reviewTypeService.deleteReviewType(Id,userId);
        return{ message: 'Review Type deleted successfully'}
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

    return this.reviewTypeService.listPaginated(
      Number(page),
      Number(limit),
      search,
      activeBool,
    );
  }

  @Get('review-type-profile/:id')
    async getReviewTypeProfile(
    @Param('id') Id: string) {
    return this.reviewTypeService.getReviewTypeProfile(Id);
  }
}