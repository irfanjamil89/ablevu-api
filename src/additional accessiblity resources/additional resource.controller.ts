import { Controller, Get, Post, Patch, Body, Param, Delete, Query } from '@nestjs/common';
import { AdditionalResourceService } from './additional resource.service';
import { AdditionalResourceDto } from './additional resource.dto';

@Controller('additional-resource')
export class AdditionalResourceController {
    constructor(private service: AdditionalResourceService) { }

    @Post('create/:userId')
    async createAdditionalResource(@Param('userId') userId: string, @Body() dto: AdditionalResourceDto) {
        await this.service.createAdditionalResource(userId, dto);
        return { status: 'ok', message: 'additional resource created successfully' }
    }

    @Patch('update/:id/:userId')
    async updateAdditionalResource(@Param('id') id: string,
        @Param('userId') userId: string,
        @Body() dto: AdditionalResourceDto) {
        await this.service.updateAdditionalResource(id, userId, dto);
        return { status: 'ok', message: 'additional resource updated successfully' }
    }

    @Delete('delete/:id')
    async deleteAdditionalResource(@Param('id') id: string) {
        await this.service.deleteAdditionalResource(id);
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