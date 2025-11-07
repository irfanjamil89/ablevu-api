import { Body, Controller, Patch, Post, Param, Delete, Get, Query } from "@nestjs/common";
import { CreateBusinessDto } from "./create-business.dto";
import { UpdateBusinessDto } from "./update-business.dto";
import { BusinessService } from "./business.service";

@Controller('business')
export class BusinessController {
    constructor( private businessService: BusinessService ) {}

@Post('create/:UserId')
  async createBusiness(
    @Param('UserId') UserId: string,
    @Body() dto: CreateBusinessDto,
  ) {
    await this.businessService.createBusiness(UserId, dto);
    return { message: 'Business created successfully' };
  }

@Patch('update/:id')
  async updateBusiness(
    @Param('id') Id: string, 
    @Body() dto: UpdateBusinessDto, 
  ) {
    await this.businessService.updateBusiness(Id, dto);
    return { message: 'Business updated successfully' };
}

@Delete('delete/:id')
  async deleteBusiness(
    @Param('id') Id: string) {
    await this.businessService.deleteBusiness(Id);
    return{ message: 'Business deleted successfully'}
  }

@Get('list')
  async listPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('active') active?: string,
    @Query('businessTypeId') businessTypeId?: string,
  ) {

    const activeBool =
      active === undefined ? undefined : active === 'true' ? true : false;

    return this.businessService.listPaginated(Number(page), Number(limit), {
      search,
      city,
      country,
      active: activeBool,
      businessTypeId,
      
    });
  }

@Get('business-profile/:id')
async getBusinessProfile(
    @Param('id') Id: string) {
    return this.businessService.getBusinessProfile(Id);
  }
}