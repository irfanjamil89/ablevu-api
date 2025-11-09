import { Controller, Get, Post, Request, Patch, Body, Param, Delete, Query } from '@nestjs/common';
import { AccessibleFeatureTypeService } from './accessible feature-type.service';
import { AccessibleFeatureTypeDto } from './accessible feature-type.dto';

@Controller('accessible-feature-types')
export class AccessibleFeatureTypeController {
    constructor(private service: AccessibleFeatureTypeService) {}

  @Post('create/:userId')
async createaccessiblefeaturetype(@Param('userId') userId: string, @Body() dto: AccessibleFeatureTypeDto ) {
    await this.service.createAccessibleFeatureType(dto, userId);
    return { status: 'ok', message: 'accessible feature-type created successfully' }    
}

@Patch('update/:id/:userId')
async updateaccessiblefeaturetype(@Param('id') id: string,
 @Param('userId') userId: string,
 @Body() dto: AccessibleFeatureTypeDto ) {
    await this.service.updateAccessibleFeatureType(dto, id , userId);
    return { status: 'ok', message: 'accessible feature-type updated successfully' }    
}

@Delete('delete/:id/:userId')
async deleteaccessiblefeaturetype(@Param('id') id: string, @Param('userId') userId: string ) {
    await this.service.deleteAccessibleFeatureType(id, userId);
    return { status: 'ok', message: 'accessible feature-type deleted successfully' }    
}

@Get('accessiblefeaturetype/:id')
async getaccessiblefeaturetype(@Param('id') id: string ) {
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
