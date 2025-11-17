import { Controller, Param, Post, Body, Patch, Delete, Get, Query, UseGuards} from "@nestjs/common";
import { CreateBusinessMedia } from "./create-business-media.dto";
import { UpdateBusinessMedia } from "./update-business-media.dto";
import { BusinessMediaService } from "./business-media.service";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";



@Controller('business-media')
export class BusinessMediaController{
    constructor(
        private readonly mediaService: BusinessMediaService,
    ) {}

    @Post('create')
    @UseGuards(JwtAuthGuard)
        async createBusinessMedia(
            @UserSession() user : any,
            @Body() dto: CreateBusinessMedia,
        ) {
              await this.mediaService.createBusinessMedia(user.id, dto);
              return { message: 'Business Media created successfully' };
        }
    
    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
            async updateBusinessMedia(
              @Param('id') Id: string, 
              @UserSession() user : any,
              @Body() dto: UpdateBusinessMedia, 
            ) {
              await this.mediaService.updateBusinessMedia(Id,user.id, dto);
              return { message: 'Business Media updated successfully' };
          }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
            async deleteBusinessMedia(
             @Param('id') Id: string,
             @UserSession() user : any,
        ) {
                await this.mediaService.deleteBusinessMedia(Id,user.id);
                return{ message: 'Business Media deleted successfully'}
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

      return this.mediaService.listpaginated(
        Number(page),
        Number(limit),
        {
            businessId,
            active: activeBool,
        }
      )
    }

    @Get('business-media-profile/:id')
    async getBusinessMediaProfile(
    @Param('id') Id: string) {
    return this.mediaService.getBusinessMediaProfile(Id);
  }

}