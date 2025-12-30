import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { BusinessAudioTourService } from './business-audio-tour.service';
import { CreateBusinessAudioTour } from './create-business-audio-tour.dto';
import { UpdateBusinessAudioTour } from './update-business-audio-tour.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserSession } from 'src/auth/user.decorator';

@Controller('business-audio-tour')
export class BusinessAudioTourController {
  constructor(
    private readonly tourService: BusinessAudioTourService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createBusinessAudioTour(
    @UserSession() user: any,
    @Body() dto: CreateBusinessAudioTour,
  ) {
    const result = await this.tourService.createBusinessAudioTour(user.id, dto);
    return { 
      message: 'Business Audio Tour created successfully',
      data: result 
    };
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  async updateBusinessAudioTour(
    @Param('id') id: string, 
    @UserSession() user: any,
    @Body() dto: UpdateBusinessAudioTour, 
  ) {
    const result = await this.tourService.updateBusinessAudioTour(id, user.id, dto);
    return { 
      message: 'Business Audio Tour updated successfully',
      data: result 
    };
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteBusinessAudioTour(
    @UserSession() user: any,
    @Param('id') id: string
  ) {
    await this.tourService.deleteBusinessAudioTour(user.id, id);
    return { message: 'Business Audio Tour deleted successfully' };
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

    return this.tourService.listPaginated(Number(page), Number(limit), {
      businessId,
      search,
      active: activeBool,
    });
  }

  @Get('business-audio-tour-profile/:id')
  async getBusinessAudioTourProfile(@Param('id') id: string) {
    return this.tourService.getBusinessAudioTourProfile(id);
  }
}