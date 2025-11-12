import { Body, Controller, Patch, Post, Param, Delete, Get, Query, UseGuards } from "@nestjs/common";
import { CreateBusinessTypeDto } from "./create-business-type.dto";
import { BusinessTypeService } from "./business-type.service";
import { UpdateBusinessTypeDto } from "./update-business-type.dto";
import { User } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller('business-type')
export class BusinessTypeController {
    constructor( private businessTypeService: BusinessTypeService ) {}

    @Post('create/:userId')
  @UseGuards(JwtAuthGuard)
    async createBusinessType(
        @User() user : any,
        @Param('userId') userId: string,
        @Body() dto: CreateBusinessTypeDto,
      ) {
        console.log(user);
        return this.businessTypeService.createBusinessType(userId, dto);
  }

    @Patch('update/:id/:userId')
    async updateBusinessType(
        @Param('id') id: string,
        @Param('userId') userId: string, 
        @Body() dto: UpdateBusinessTypeDto, 
       ) {
        return this.businessTypeService.updateBusinessType(id, userId, dto);
  }

    @Delete('delete/:id/:userId')
    async deleteBusinessType(
        @Param('id') id: string,
        @Param('userId') userId: string
      ) {
        return this.businessTypeService.deleteBusinessType(id, userId);
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