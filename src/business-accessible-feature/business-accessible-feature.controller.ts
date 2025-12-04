import {
  Controller,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Get,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { BusinessAccessibleFeatureService } from './business-accessible-feature.service';
import { CreateBusinessAccessibleFeatureDto } from './create-business-accessible-feature.dto';
import { UpdateBusinessAccessibleFeatureDto } from './update-business-accessible-feature.dto';
import { UserSession } from "src/auth/user.decorator";

@Controller('business-accessible-feature')
export class BusinessAccessibleFeatureController {
  constructor(
    private readonly service: BusinessAccessibleFeatureService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  create(
    @UserSession() user: any,
    @Body() dto: CreateBusinessAccessibleFeatureDto,
  ) {
    return this.service.create(user.id, dto);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @UserSession() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessAccessibleFeatureDto,
  ) {
    return this.service.update(id, user.id, dto);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Get('list/:businessId')
  @UseGuards(JwtAuthGuard)
  list(@Param('businessId') businessId: string) {
    return this.service.list(businessId);
  }
}
