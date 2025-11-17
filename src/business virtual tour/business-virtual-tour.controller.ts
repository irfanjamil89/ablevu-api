import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { BusinessVirtualTourService } from './business-virtual-tour.service';
import { CreateBusinessVirtualTour } from './create-business-virtual-tour.dto';
import { UpdateBusinessVirtualTour } from './update-business-virtual-tour.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserSession } from 'src/auth/user.decorator';

@Controller('business-virtual-tours')
export class BusinessVirtualTourController {
  constructor(
    private readonly toursService: BusinessVirtualTourService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
    async createBusinessVirtualTour(
      @UserSession() user : any,
      @Body() dto: CreateBusinessVirtualTour,
    ) {
      await this.toursService.createBusinessVirtualTour(user.id, dto);
      return { message: 'Business Virtual Tour created successfully' };
    }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
    async updateBusinessVirtualTour(
      @Param('id') Id: string, 
      @UserSession() user : any,
      @Body() dto: UpdateBusinessVirtualTour, 
    ) {
      await this.toursService.updateBusinessVirtualTour(Id,user.id, dto);
      return { message: 'Business Virtual Tour updated successfully' };
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteBusinessVirtualTour(
    @UserSession() user : any,
    @Param('id') id: string) {
    await this.toursService.deleteBusinessVirtualTour(user.id, id);
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
