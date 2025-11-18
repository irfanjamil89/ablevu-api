import { Controller, Param, Post, Body, Patch, Delete, Get, Query } from "@nestjs/common";
import { UpdateBusinessCustomSectionsDto } from "./update-business-custom-sections.dto";
import { CreateBusinessCustomSectionsDto } from "./create-business-custom-section.dto";
import { BusinessCustomSectionsService } from "./business-custom-sections.service";


@Controller('business-custom-sections')
export class BusinessCustomSectionsController{
    constructor(
        private readonly customSectionsservice: BusinessCustomSectionsService,
    ) {}

    @Post('create/:UserId')
        async createBusinessCustomSection(
            @Param('UserId') userId: string,
            @Body() dto: CreateBusinessCustomSectionsDto,
        ) {
              await this.customSectionsservice.createBusinessCustomSection(userId, dto);
              return { message: 'Business Custom Section created successfully' };
        }
    
    @Patch('update/:id/:userId')
            async updateBusinessCustomSection(
              @Param('id') Id: string, 
              @Param('userId') userId: string,
              @Body() dto: UpdateBusinessCustomSectionsDto, 
            ) {
              await this.customSectionsservice.updateBusinessCustomSection(Id,userId, dto);
              return { message: 'Business Custom Section updated successfully' };
          }

    @Delete('delete/:id/:userId')
            async deleteBusinessCustomSection(
             @Param('id') Id: string,
             @Param('userId') userId: string,
        ) {
                await this.customSectionsservice.deleteBusinessCustomSection(Id,userId);
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