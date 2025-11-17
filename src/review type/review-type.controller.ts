import { Controller,Post, Param, Body, Patch, Delete, Query, Get, UseGuards } from "@nestjs/common";
import { CreateReviewTypeDto } from "./create-review-type.dto";
import { UpdateReviewTypeDto } from "./update-review-type.dto";
import { ReviewTypeService } from "./review-type.service";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller('review-type')
export class ReviewTypeController{
    constructor(
        private readonly reviewTypeService: ReviewTypeService,
    ){}

    @Post('create')
    @UseGuards(JwtAuthGuard)
        async createReviewType(
          @UserSession() user : any,
          @Body() dto: CreateReviewTypeDto,
        ) {
          await this.reviewTypeService.createReviewType(user.id, dto);
          return { message: 'Review Type created successfully' };
        }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
        async updateReviewType(
          @Param('id') Id: string, 
          @UserSession() user : any,
          @Body() dto: UpdateReviewTypeDto, 
        ) {
          await this.reviewTypeService.updateReviewType(Id, user.id, dto);
          return { message: 'Review Type updated successfully' };
      }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
      async deleteReviewType(
        @Param('id') Id: string,
        @UserSession() user : any,
    ) {
        await this.reviewTypeService.deleteReviewType(Id, user.id);
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