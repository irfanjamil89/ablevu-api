import { Controller, Post, Param, Body, Patch, Delete, Get, Query, UseGuards } from "@nestjs/common";
import { CreateAccessibleCityDto } from "./create-accessible-city.dto";
import { AccessibleCityService } from "./accessible-city.service";
import { UpdateAccessibleCityDto } from "./update-accessible-city";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";



@Controller('accessible-city')
export class AccessibleCityController {
  constructor(private readonly accessiblecityservice: AccessibleCityService) { }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createAccessibleCity(
    @UserSession() user: any,
    @Body() dto: CreateAccessibleCityDto,
  ) {
    const createdCity = await this.accessiblecityservice.createAccessibleCity(user.id, dto);
    return { message: 'Accessible City created successfully',
      id: createdCity.id, 
     };
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  async updateAccessibleCity(
    @Param('id') id: string,
    @UserSession() user: any,
    @Body() dto: UpdateAccessibleCityDto,
  ) {
    await this.accessiblecityservice.updateAccessibleCity(id, user.id, dto);
    return { message: 'Accessible City updated successfully' };
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteAccessibleCity(
    @Param('id') id: string,
    @UserSession() user: any,
  ) {
    return this.accessiblecityservice.deleteAccessibleCity(id, user.id);
  }

  @Get('list')
  list(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('featured') featured?: string,
  ) {
    const f =
      featured === undefined ? undefined : featured === 'true' ? true : false;

    return this.accessiblecityservice.listPaginated(Number(page), Number(limit), {
      search,
      featured: f,
    });
  }
  @Get('accessible-city/:id')
  async getAccessibleCity(
    @Param('id') Id: string) {
    return this.accessiblecityservice.getAccessibleCity(Id);
  }




}
