import { Controller, Param, Post, Body, Patch, Delete, Get, Query, UseGuards} from "@nestjs/common";
import { CreateBusinessImages } from "./create-business-images.dto";
import { UpdateBusinessImages } from "./update-business-images.dto";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { BusinessImagesService } from "./business-images.service";


@Controller('business-images')
export class BusinessImagesController{
    constructor(
        private readonly imagesService: BusinessImagesService,
    ) {}

    @Post('create')
    @UseGuards(JwtAuthGuard)
        async createBusinessImages(
            @UserSession() user : any,
            @Body() dto: CreateBusinessImages,
        ) {
              await this.imagesService.createBusinessImages(user.id, dto);
              return { message: 'Business Images created successfully' };
        }
    
    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
            async updateBusinessImages(
              @Param('id') Id: string, 
              @UserSession() user : any,
              @Body() dto: UpdateBusinessImages, 
            ) {
              await this.imagesService.updateBusinessImages(Id,user.id, dto);
              return { message: 'Business Images updated successfully' };
          }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
            async deleteBusinessImages(
             @Param('id') Id: string,
             @UserSession() user : any,
        ) {
                await this.imagesService.deleteBusinessImages(Id,user.id);
                return{ message: 'Business Images deleted successfully'}
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

      return this.imagesService.listpaginated(
        Number(page),
        Number(limit),
        {
            businessId,
            active: activeBool,
        }
      )
    }

    @Get('business-images-profile/:id')
    async getBusinessImagesProfile(
    @Param('id') Id: string) {
    return this.imagesService.getBusinessImagesProfile(Id);
  }

}