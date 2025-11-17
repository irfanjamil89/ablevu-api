import { Body, Controller, Patch, Post, Param, Delete, Get, Query, UseGuards } from "@nestjs/common";
import { CreateBusinessDto } from "./create-business.dto";
import { UpdateBusinessDto } from "./update-business.dto";
import { BusinessService } from "./business.service";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller('business')
export class BusinessController {
    constructor( private businessService: BusinessService ) {}

@Post('create')
@UseGuards(JwtAuthGuard)
  async createBusiness(
    @UserSession() user : any,
    @Body() dto: CreateBusinessDto,
  ) {
    await this.businessService.createBusiness(user.id, dto);
    return { message: 'Business created successfully' };
  }

@Patch('update/:id')
@UseGuards(JwtAuthGuard)
  async updateBusiness(
    @Param('id') Id: string, 
    @UserSession() user : any,
    @Body() dto: UpdateBusinessDto, 
  ) {
    await this.businessService.updateBusiness(Id, user.id, dto);
    return { message: 'Business updated successfully' };
}

@Delete('delete/:id')
@UseGuards(JwtAuthGuard)
async deleteBusiness(
    @Param('id') id: string,
    @UserSession() user : any){
    await this.businessService.deleteBusiness(id, user.id);
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