import { Controller, Get, Post, Patch, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AdditionalResourceService } from './additional resource.service';
import { AdditionalResourceDto } from './additional resource.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserSession } from 'src/auth/user.decorator';

@Controller('additional-resource')
export class AdditionalResourceController {
    constructor(private service: AdditionalResourceService) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createAdditionalResource(@UserSession() user: any, @Body() dto: AdditionalResourceDto) {
        await this.service.createAdditionalResource(user.id, dto);
        return { status: 'ok', message: 'additional resource created successfully' }
    }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
    async updateAdditionalResource(@Param('id') id: string,
        @UserSession() userId: any,
        @Body() dto: AdditionalResourceDto) {
        await this.service.updateAdditionalResource(id, userId, dto);
        return { status: 'ok', message: 'additional resource updated successfully' }
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    async deleteAdditionalResource(
        @Param('id') id: string,
        @UserSession() user: any, 
    ) {
        await this.service.deleteAdditionalResource(id, user.id);
        return { status: 'ok', message: 'Additional Resource deleted successfully' }
    }

    @Get('get/:id')
    async getAdditionalResource(@Param('id') id: string) {
        return this.service.getAdditionalResource(id);
    }

    @Get('list')
    AdditionalResourceList(
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