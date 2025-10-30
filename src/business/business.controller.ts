import { Body, Controller, Patch, Post, Req, Param } from "@nestjs/common";
import { CreateBusinessDto } from "./create-business.dto";
import { UpdateBusinessDto } from "./update-business.dto";
import { BusinessService } from "./business.service";
import { AccessibilityFeatureDto } from "./accessibility.dto";

@Controller('business')
export class BusinessController {
    constructor( private service: BusinessService ) {}

@Post('create')
async createBusiness(@Body() dto: CreateBusinessDto, @Req() req: any) {
    const ownerId = req.user.sub ?? req.user.id;
    const created = await this.service.createBusiness(dto, ownerId);
    return { status: 'ok', business: created }
}    

@Patch('update/:id')
async updateBusiness(@Param('id') id: string, @Body() dto: UpdateBusinessDto, @Req() req: any) {
    const ownerId = req.user.sub ?? req.user.id;
    const updated = await this.service.updateBusiness(id ,dto, ownerId);
    return { status: 'ok', business: updated }
}

@Patch('accessibility-features/:id')
async AccessibilityFeatures(@Param('id') id: string, @Body() dto: AccessibilityFeatureDto) {
    const businessId = id
    await this.service.AccessbilityFeatures( dto, businessId);
    return { status: 'ok', message: 'Accessibility features added successfully' }
}

}