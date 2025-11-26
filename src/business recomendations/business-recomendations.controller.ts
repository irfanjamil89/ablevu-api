import { Controller, UseGuards, Post, Query, Body, Patch, Param, Delete, Get } from "@nestjs/common";
import { CreateRecomendationsDto } from "./create-business-recomendations.dto";
import { UpdateRecomendationsDto } from "./update-business-recomendations.dto";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { BusinessRecomendationsService } from "./business-recomendations.service";

@Controller('business-recomendations')
export class BusinessRecomendationsController{
    constructor(
        private readonly recomendationsService: BusinessRecomendationsService,
    ){}

    @Post('create')
      @UseGuards(JwtAuthGuard)
        async createBusinessRecomendations(
          @UserSession() user : any,
          @Body() dto: CreateRecomendationsDto,
        ) {
          await this.recomendationsService.createBusinessRecomendations(user.id, dto);
          return { message: 'Business Recomendations created successfully' };
        }
    
      @Patch('update/:id')
      @UseGuards(JwtAuthGuard)
        async updateBusinessRecomendations(
          @Param('id') Id: string, 
          @UserSession() user : any,
          @Body() dto: UpdateRecomendationsDto, 
        ) {
          await this.recomendationsService.updateBusinessRecomendations(Id,user.id, dto);
          return { message: 'Business Recomendations updated successfully' };
      }
    
      @Delete('delete/:id')
      @UseGuards(JwtAuthGuard)
      async deleteBusinessRecomendations(
        @UserSession() user : any,
        @Param('id') id: string) {
        await this.recomendationsService.deleteBusinessRecomendations(user.id, id);
        return{ message: 'Business Recomendations  deleted successfully'}
    }

    @Get('list')
    listPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('businessId') businessId?: string,
    @Query('active') active?: string,
  ) {
    const activeBool =
      active === undefined ? undefined : active === 'true' ? true : false;

    return this.recomendationsService.listPaginated(
      Number(page),
      Number(limit),
      {
        businessId,
        active: activeBool,
      },
    );
}
      @Get('business-recomendations-profile/:id')
        async getBusinessRecomendationsProfile(
        @Param('id') Id: string) {
        return this.recomendationsService.getBusinessRecomendationsProfile(Id);
      }
}
    


