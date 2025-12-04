import { Body, Controller, Post, Param, Delete, UseGuards } from "@nestjs/common";
import { BusinessPartnerService } from "./business-partner.service";
import { BusinessPartnerDto } from "./business-partner.dto";
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserSession } from "src/auth/user.decorator";

@Controller('business-partner')
export class BusinessPartnerController {
    constructor(private service: BusinessPartnerService) { }

    @Post('create/:id')
    @UseGuards(JwtAuthGuard)
    async createBusinessPartner(
        @Param('id') id: string,
        @UserSession() user: any, 
        @Body() dto: BusinessPartnerDto) {
        await this.service.createBusinessPartner(dto, id, user.id);
        return { status: 'ok', message: ' Business Partner created successfully' }
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    async deleteBusinessPartner(
        @Param('id') id: string,
        @UserSession() user: any,
    ) {
        await this.service.deleteBusinessPartner(id, user.id);
        return { status: 'ok', message: ' Business Partner deleted successfully' }
    }

}