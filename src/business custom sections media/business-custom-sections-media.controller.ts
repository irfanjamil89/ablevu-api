import { Controller, Param, Post, Body, Patch, Delete, Get, Query, UseGuards } from "@nestjs/common";
import { BusinessCustomSectionsMediaService } from "./business-custom-sections-media.service";
import { BusinessCustomSectionsMediaDto } from "./business-custom-sections-media.dto";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller('business-custom-sections-media')
export class BusinessCustomSectionsMediaController {
    constructor(
        private readonly customSectionsMediaService: BusinessCustomSectionsMediaService,
    ) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createBusinessCustomSectionMedia(
        @UserSession() user: any,
        @Body() dto: BusinessCustomSectionsMediaDto,
    ) {
        await this.customSectionsMediaService.createBusinessCustomSectionMedia(user.id, dto);
        return { message: 'Business Custom Section Media created successfully' };
    }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
    async updateBusinessCustomSectionMedia(
        @Param('id') Id: string,
        @UserSession() user: any,
        @Body() dto: BusinessCustomSectionsMediaDto,
    ) {
        await this.customSectionsMediaService.updateBusinessCustomSectionMedia(Id, user.id, dto);
        return { message: 'Business Custom Section Media updated successfully' };
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    async deleteBusinessCustomSectionMedia(
        @Param('id') Id: string,
        @UserSession() user: any,
    ) {
        await this.customSectionsMediaService.deleteBusinessCustomSectionMedia(Id, user.id);
        return { message: 'Business Custom Section Media deleted successfully' }
    }


    @Get('list')
    @UseGuards(JwtAuthGuard)
    async listpaginated(
        @Query('page') page = '1',
        @Query('limit') limit = '10',
        @Query('businessId') businessId: string,
        @Query('active') active: string,
    ) {
        const activeBool =
            active === undefined ? undefined : active === 'true';

        return this.customSectionsMediaService.listpaginated(
            Number(page),
            Number(limit),
            {
                businessId,
                active: activeBool,
            }
        );
    }
}