import { Controller, UseGuards, Post, Query, Body, Patch, Param, Delete, Get } from "@nestjs/common";
import { BusinessScheduleService } from "./business-schedule.service";
import { CreateScheduleDto } from "./create-business-schedule.dto";
import { UpdateScheduleDto } from "./update-business-schedule.dto";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller('business-schedules')
export class BusinessScheduleController{
    constructor(
        private readonly scheduleService: BusinessScheduleService
    ){}

    @Post('create')
      @UseGuards(JwtAuthGuard)
        async createBusinessSchedule(
          @UserSession() user : any,
          @Body() dto: CreateScheduleDto,
        ) {
          await this.scheduleService.createBusinessSchedule(user.id, dto);
          return { message: 'Business Schedule created successfully' };
        }
    
      @Patch('update/:id')
      @UseGuards(JwtAuthGuard)
        async updateBusinessSchedule(
          @Param('id') Id: string, 
          @UserSession() user : any,
          @Body() dto: UpdateScheduleDto, 
        ) {
          await this.scheduleService.updateBusinessVirtualTour(Id,user.id, dto);
          return { message: 'Business Schedule updated successfully' };
      }
    
      @Delete('delete/:id')
      @UseGuards(JwtAuthGuard)
      async deleteBusinessSchedule(
        @UserSession() user : any,
        @Param('id') id: string) {
        await this.scheduleService.deleteBusinessSchedule(user.id, id);
        return{ message: 'Business Schedule  deleted successfully'}
      }
    @Get('list')
    listPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('businessId') businessId?: string,
    @Query('day') day?: string,
    @Query('active') active?: string,
  ) {
    const activeBool =
      active === undefined ? undefined : active === 'true' ? true : false;

    return this.scheduleService.listPaginated(
      Number(page),
      Number(limit),
      {
        businessId,
        day,
        active: activeBool,
      },
    );
}
      @Get('business-schedule-profile/:id')
        async getBusinessScheduleProfile(
        @Param('id') Id: string) {
        return this.scheduleService.getBusinessScheduleProfile(Id);
      }
}
    


