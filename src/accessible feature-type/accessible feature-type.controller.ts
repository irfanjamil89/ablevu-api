import { Controller, Get, Post, Request, Patch, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AccessibleFeatureTypeService } from './accessible feature-type.service';
import { AccessibleFeatureTypeDto } from './accessible feature-type.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserSession } from 'src/auth/user.decorator';

@Controller('accessible-feature-types')
export class AccessibleFeatureTypeController {
  constructor(private service: AccessibleFeatureTypeService) { }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createaccessiblefeaturetype(@UserSession() user: any, @Body() dto: AccessibleFeatureTypeDto) {
    await this.service.createAccessibleFeatureType(dto, user.id);
    return { status: 'ok', message: 'accessible feature-type created successfully' }
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  async updateaccessiblefeaturetype(@Param('id') id: string,
    @UserSession() userId: any,
    @Body() dto: AccessibleFeatureTypeDto) {
    await this.service.updateAccessibleFeatureType(dto, id, userId);
    return { status: 'ok', message: 'accessible feature-type updated successfully' }
  }

  @Delete('delete/:id')
  async deleteaccessiblefeaturetype(@Param('id') id: string) {
    await this.service.deleteAccessibleFeatureType(id);
    return { status: 'ok', message: 'accessible feature-type deleted successfully' }
  }

  @Get('accessiblefeaturetype/:id')
  async getaccessiblefeaturetype(@Param('id') id: string) {
    return this.service.getAccessibleFeatureType(id);
  }

  @Get('list')
  AccessibleFeaturesTypesList(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('active') active?: string) {

    const isActive =
      active === undefined ? undefined : active === 'true' ? true : false;

    return this.service.getPaginatedList(Number(page), Number(limit), {
      search,
      active: isActive,
    });
  }


}
