import { Controller, Get, Post, Patch, Body, Param, Delete, Query  } from '@nestjs/common';
import { AccessibleFeatureService } from './accessible feature.service';

@Controller('accessible-feature')
export class AccessibleFeatureController {
    constructor(private service: AccessibleFeatureService) {}

    @Post('create/:userId')
    async createaccessiblefeature(@Param('userId') userId: string, @Body('title') title : string ) {
        await this.service.createAccessibleFeature(userId, title);
        return { status: 'ok', message: 'accessible feature created successfully' }    
    }

    @Patch('update/:id/:userId')
    async updateaccessiblefeature(@Param('id') id: string,
        @Param('userId') userId: string,
        @Body('title') title : string ) {
        await this.service.updateAccessibleFeature(id , userId, title);
        return { status: 'ok', message: 'accessible feature updated successfully' }    
    }

    @Delete('delete/:id/:userId')
    async deleteaccessiblefeature(@Param('id') id: string, @Param('userId') userId: string ) {
        await this.service.deleteAccessibleFeature(id, userId);
        return { status: 'ok', message: 'accessible feature deleted successfully' }    
    }

    @Get('accessiblefeature/:id')
    async getaccessiblefeature(@Param('id') id: string ) {
        return this.service.getAccessibleFeature(id);
    }

    @Get('list')
     AccessibleFeaturesList(
        @Query('page') page = 1, 
        @Query('limit') limit = 10, 
        @Query('search') search?: string, ) {
        return this.service.getPaginatedList(Number(page), Number(limit), {
          search,
        });
    }

}