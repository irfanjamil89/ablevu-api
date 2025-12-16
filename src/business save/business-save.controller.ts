import { Controller, Param, Post, Body, Patch, Delete, Get, Query, UseGuards } from "@nestjs/common";
import { BusinessSaveService } from "./business-save.service";
import { CreateBusinessSaveDto } from "./create-business-save.dto";
import { UpdateBusinessSaveDto } from "./update-business-save.dto";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller('business-save')
export class BusinessSaveController{
    constructor(
        private readonly saveService: BusinessSaveService,
    ) {}

    @Post('create')
    @UseGuards(JwtAuthGuard)
        async createBusinessSave(
            @UserSession() user : any,
            @Body() dto: CreateBusinessSaveDto,
        ) {
              return await this.saveService.createBusinessSave(user.id, dto);
              
        }
    
    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
            async updateBusinessSave(
              @Param('id') Id: string, 
              @UserSession() user : any,
              @Body() dto: UpdateBusinessSaveDto, 
            ) {
              return await this.saveService.updateBusinessSave(Id,user.id, dto);
              
          }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
            async deleteBusinessSave(
             @Param('id') Id: string,
             @UserSession() user : any,
        ) {
            return await this.saveService.deleteBusinessSave(Id,user.id);
                
        }
    
    @Get('list')
        @UseGuards(JwtAuthGuard)
        async listpaginated(
        @UserSession() user: any,
        @Query('page') page = '1',
        @Query('limit') limit = '10',
        ) {
        return this.saveService.listPaginatedByUser(
            user.id,
            Number(page),
            Number(limit),
        );
        }


    @Get('business-save-profile/:id')
    async getBusinessSaveProfile(
    @Param('id') Id: string) {
    return this.saveService.getBusinessSaveProfile(Id);
  }

}