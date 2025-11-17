import { Body, Controller, Patch, Post, Param, Delete, Get, Query, UseGuards } from "@nestjs/common";
import { CreateBusinessTypeDto } from "./create-business-type.dto";
import { BusinessTypeService } from "./business-type.service";
import { UpdateBusinessTypeDto } from "./update-business-type.dto";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller('business-type')
export class BusinessTypeController {
    constructor( private businessTypeService: BusinessTypeService ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
    async createBusinessType(
        @UserSession() user : any,
        @Body() dto: CreateBusinessTypeDto,
      ) {
        console.log(user);
        return this.businessTypeService.createBusinessType(user.id, dto);
  }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
    async updateBusinessType(
        @Param('id') id: string,
        @UserSession() user : any,
        @Body() dto: UpdateBusinessTypeDto, 
       ) {
        return this.businessTypeService.updateBusinessType(id, user.id, dto);
  }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    async deleteBusinessType(
        @Param('id') id: string,
        @UserSession() user : any,
      ) {
        return this.businessTypeService.deleteBusinessType(id, user.id);
  }

    @Get('list')
    listPaginated(
    @Query('page') page = 1, 
    @Query('limit') limit = 10, 
    @Query('search') search?: string, 
    @Query('active') active?: string) {

    const activeBool =
      active === undefined ? undefined : active === 'true' ? true : false;

    return this.businessTypeService.listPaginated(Number(page), Number(limit), {
      search,
      active: activeBool,
    });
  }
  
    @Get('business-type/:id')
    async getBusinessType(
    @Param('id') Id: string) {
    return this.businessTypeService.getBusinessType(Id);
  }

    
}