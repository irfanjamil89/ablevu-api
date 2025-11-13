import { Body, Controller, Patch, Post, Get, Param, Delete, Query } from "@nestjs/common";
import { PartnerService } from "./partner.service";
import { PartnerDto } from "./partner.dto";

@Controller('partner')
export class PartnerController {
    constructor(private service: PartnerService) { }

    @Post('create/:userId')
    async createPartner(@Param('userId') userId: string, @Body() dto: PartnerDto) {
        await this.service.createPartner(dto, userId);
        return { status: 'ok', message: 'Partner created successfully' }
    }

    @Patch('update/:id/:userId')
    async updatePartner(@Param('id') id: string,
        @Param('userId') userId: string,
        @Body() dto: PartnerDto) {
        await this.service.updatePartner(id, userId, dto);
        return { status: 'ok', message: 'Partner updated successfully' }
    }

    @Delete('delete/:id')
    async deletePartner(@Param('id') id: string) {
        await this.service.deletePartner(id);
        return { status: 'ok', message: 'Partner deleted successfully' }
    }

    @Get('getpartner/:id')
    async getPartner(@Param('id') id: string) {
        return this.service.getPartner(id);
    }

    @Get('list')
    PartnerList(
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