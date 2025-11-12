import { Controller, Get, Post, Patch, Body, Param, Delete, Query  } from '@nestjs/common';
import { AccessibleFeatureService } from './accessible feature.service';
import { AccessibleFeatureDto } from './accessible feature.dto';
@Controller('accessible-feature')
export class AccessibleFeatureController {
    constructor(private service: AccessibleFeatureService) {}

    @Post('create/:userId')
    async createAccessibleFeature(@Param('userId') userId: string, @Body() dto: AccessibleFeatureDto ) {
        await this.service.createAccessibleFeature(userId, dto);
        return { status: 'ok', message: 'accessible feature created successfully' }    
    }

    @Patch('update/:id/:userId')
    async updateAccessibleFeature(@Param('id') id: string,
        @Param('userId') userId: string,
        @Body() dto: AccessibleFeatureDto ) {
        await this.service.updateAccessibleFeature(id , userId, dto);
        return { status: 'ok', message: 'accessible feature updated successfully' }    
    }

    @Delete('delete/:id')
    async deleteAccessibleFeature(@Param('id') id: string) {
        await this.service.deleteAccessibleFeature(id);
        return { status: 'ok', message: 'accessible feature deleted successfully' }    
    }

    @Get('accessiblefeature/:id')
    async getAccessibleFeature(@Param('id') id: string ) {
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