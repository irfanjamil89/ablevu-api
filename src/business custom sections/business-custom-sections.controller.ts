import { Controller, Param, Post, Body, Patch, Delete, Get, Query, UseGuards } from "@nestjs/common";
import { UpdateBusinessCustomSectionsDto } from "./update-business-custom-sections.dto";
import { CreateBusinessCustomSectionsDto } from "./create-business-custom-section.dto";
import { BusinessCustomSectionsService } from "./business-custom-sections.service";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";



@Controller('business-custom-sections')
export class BusinessCustomSectionsController{
    constructor(
        private readonly customSectionsservice: BusinessCustomSectionsService,
    ) {}

    @Post('create')
    @UseGuards(JwtAuthGuard)
        async createBusinessCustomSection(
            @UserSession() user : any,
            @Body() dto: CreateBusinessCustomSectionsDto,
        ) {
              await this.customSectionsservice.createBusinessCustomSection(user.id, dto);
              return { message: 'Business Custom Section created successfully' };
        }
    
    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
            async updateBusinessCustomSection(
              @Param('id') Id: string, 
              @UserSession() user : any,
              @Body() dto: UpdateBusinessCustomSectionsDto, 
            ) {
              await this.customSectionsservice.updateBusinessCustomSection(Id,user.id, dto);
              return { message: 'Business Custom Section updated successfully' };
          }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
            async deleteBusinessCustomSection(
             @Param('id') Id: string,
             @UserSession() user : any,
        ) {
                await this.customSectionsservice.deleteBusinessCustomSection(Id,user.id);
                return{ message: 'Business Custom Section deleted successfully'}
        }
    
    @Get('list')
    async listpaginated(
        @Query('page') page='1',
        @Query('limit') limit='10',
        @Query('businessId') businessId: string,
        @Query('active') active: string,

    ){
    const activeBool =
    active === undefined ? undefined : active === 'true';

      return this.customSectionsservice.listpaginated(
        Number(page),
        Number(limit),
        {
            businessId,
            active: activeBool,
        }
      )
    }

    @Get('business-custom-sections-profile/:id')
    async getBusinessCustomSectionProfile(
    @Param('id') Id: string) {
    return this.customSectionsservice.getBusinessCustomSectionProfile(Id);
  }

}