import { Body, Controller, Patch, Post, Req, Param, Delete, Get } from "@nestjs/common";
import { CreateBusinessDto } from "./create-business.dto";
import { UpdateBusinessDto } from "./update-business.dto";
import { BusinessService } from "./business.service";

@Controller('business')
export class BusinessController {
    constructor( private businessService: BusinessService ) {}

  @Post('create/:userId')
  async createBusinessForUser(
    @Param('userId') userId: string,
    @Body() dto: CreateBusinessDto,
  ) {
    return this.businessService.createBusinessForUser(userId, dto);
  }

@Patch('update/:id')
async updateBusiness(
    @Param('id') Id: string, 
    @Body() dto: UpdateBusinessDto, 
   ) {
    return this.businessService.updateBusiness(Id, dto);
}

@Delete('delete/:id')
async deleteBusiness(
    @Param('id') Id: string) {
    return this.businessService.deleteBusiness(Id);
  }

@Get('all-businesses/:userId')
async getAllBusinessesForUser(
    @Param('userId') userId: string) {
    return this.businessService.getAllBusinessesForUser(userId);
  } 

@Get('business-profile/:id')
async getBusinessProfile(
    @Param('id') Id: string) {
    return this.businessService.getBusinessProfile(Id);
  }

}