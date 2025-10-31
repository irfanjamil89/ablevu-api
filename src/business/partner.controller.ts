import { Body, Controller, Patch, Post, Req, Param } from "@nestjs/common";
import { PartnerService } from "./partner.service";
import { PartnerDto } from "./partner.dto";

@Controller('partner')
export class PartnerController {
    constructor( private service: PartnerService ) {}

@Post('create/:id')
async createPartner(@Param('id') id: string, @Body() dto: PartnerDto ) {
    const partnerID = id
    await this.service.createPartner(dto, partnerID);
    return { status: 'ok', message: 'Partner created successfully' }    
}

}