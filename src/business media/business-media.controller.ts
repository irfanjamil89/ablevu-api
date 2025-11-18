import { Controller, Param, Post, Body, Patch, Delete, Get, Query } from "@nestjs/common";
import { CreateBusinessMedia } from "./create-business-media.dto";
import { UpdateBusinessMedia } from "./update-business-media.dto";
import { BusinessMediaService } from "./business-media.service";


@Controller('business-media')
export class BusinessMediaController{
    constructor(
        private readonly mediaService: BusinessMediaService,
    ) {}

    @Post('create/:UserId')
        async createBusinessMedia(
            @Param('UserId') userId: string,
            @Body() dto: CreateBusinessMedia,
        ) {
              await this.mediaService.createBusinessMedia(userId, dto);
              return { message: 'Business Media created successfully' };
        }
    
    @Patch('update/:id/:userId')
            async updateBusinessMedia(
              @Param('id') Id: string, 
              @Param('userId') userId: string,
              @Body() dto: UpdateBusinessMedia, 
            ) {
              await this.mediaService.updateBusinessMedia(Id,userId, dto);
              return { message: 'Business Media updated successfully' };
          }

    @Delete('delete/:id/:userId')
            async deleteBusinessMedia(
             @Param('id') Id: string,
             @Param('userId') userId: string,
        ) {
                await this.mediaService.deleteBusinessMedia(Id,userId);
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