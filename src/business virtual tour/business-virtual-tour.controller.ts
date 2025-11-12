import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { BusinessVirtualTourService } from './business-virtual-tour.service';
import { CreateBusinessVirtualTour } from './create-business-virtual-tour.dto';
import { UpdateBusinessVirtualTour } from './update-business-virtual-tour.dto';

@Controller('business-virtual-tours')
export class BusinessVirtualTourController {
  constructor(
    private readonly toursService: BusinessVirtualTourService,
  ) {}

  @Post('create/:UserId')
    async createBusinessVirtualTour(
      @Param('UserId') userId: string,
      @Body() dto: CreateBusinessVirtualTour,
    ) {
      await this.toursService.createBusinessVirtualTour(userId, dto);
      return { message: 'Business Virtual Tour created successfully' };
    }

  @Patch('update/:id/:userId')
    async updateBusinessVirtualTour(
      @Param('id') Id: string, 
      @Param('userId') userId: string,
      @Body() dto: UpdateBusinessVirtualTour, 
    ) {
      await this.toursService.updateBusinessVirtualTour(Id,userId, dto);
      return { message: 'Business Virtual Tour updated successfully' };
  }

  @Delete('delete/:id')
  async deleteBusinessVirtualTour(
    @Param('id') Id: string) {
    await this.toursService.deleteBusinessVirtualTour(Id);
    return{ message: 'Business Virtual Tour  deleted successfully'}
  }

  @Get('list')
  listPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('businessId') businessId?: string,
    @Query('search') search?: string,
    @Query('active') active?: string, 
  ) {
    const activeBool =
      active === undefined ? undefined : active === 'true' ? true : false;

    return this.toursService.listPaginated(Number(page), Number(limit), {
      businessId,
      search,
      active: activeBool,
    });
}

  @Get('business-virtual-tour-profile/:id')
    async getBusinessVirtualTourProfile(
    @Param('id') Id: string) {
    return this.toursService.getBusinessVirtualTourProfile(Id);
  }
}
