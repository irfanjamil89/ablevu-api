import { Controller, Post, Param, Body, Patch, Delete, Get, Query } from "@nestjs/common";
import { CreateAccessibleCityDto } from "./create-accessible-city.dto";
import { AccessibleCityService } from "./accessible-city.service";
import { UpdateAccessibleCityDto } from "./update-accessible-city";


@Controller('accessible-city')
export class AccessibleCityController{
    constructor(private readonly accessiblecityservice: AccessibleCityService){}

    @Post('create/:UserId')
      async createAccessibleCity(
        @Param('UserId') UserId: string,
        @Body() dto: CreateAccessibleCityDto,
      ) {
        await this.accessiblecityservice.createAccessibleCity(UserId, dto);
        return { message: 'Accessible City created successfully' };
      }

    @Patch('update/:id/:userId')
      async updateAccessibleCity(
        @Param('id') id: string, 
        @Param('userId') userId: string,
        @Body() dto: UpdateAccessibleCityDto, 
      ) {
        await this.accessiblecityservice.updateAccessibleCity(id, userId, dto);
        return { message: 'Accessible City updated successfully' };
    }

    @Delete('delete/:id/:userId')
        async deleteAccessibleCity(
            @Param('id') id: string,
            @Param('userId') userId: string
          ) {
            return this.accessiblecityservice.deleteAccessibleCity(id, userId);
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
