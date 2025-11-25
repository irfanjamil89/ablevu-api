import { Controller, Get, Post, Patch, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AccessibleFeatureService } from './accessible feature.service';
import { AccessibleFeatureDto } from './accessible feature.dto';
import { UserSession } from 'src/auth/user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/entity/user.entity';
@Controller('accessible-feature')
export class AccessibleFeatureController {
    constructor(private service: AccessibleFeatureService) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createAccessibleFeature(@UserSession() user: any, @Body() dto: AccessibleFeatureDto) {
        await this.service.createAccessibleFeature(user.id, dto);
        return { status: 'ok', message: 'accessible feature created successfully' }
    }

    @Patch('update/:id/')
    @UseGuards(JwtAuthGuard)
    async updateAccessibleFeature(@Param('id') id: string,
        @UserSession() userId: any,
        @Body() dto: AccessibleFeatureDto) {
        await this.service.updateAccessibleFeature(id, userId, dto);
        return { status: 'ok', message: 'accessible feature updated successfully' }
    }

    @Delete('delete/:id')
    async deleteAccessibleFeature(@Param('id') id: string) {
        await this.service.deleteAccessibleFeature(id);
        return { status: 'ok', message: 'accessible feature deleted successfully' }
    }

    @Get('accessiblefeature/:id')
    async getAccessibleFeature(@Param('id') id: string) {
        return this.service.getAccessibleFeature(id);
    }

    @Get('list')
    AccessibleFeaturesList(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('search') search?: string,) {
        return this.service.getPaginatedList(Number(page), Number(limit), {
            search,
        });
    }

}