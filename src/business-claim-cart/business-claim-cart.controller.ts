import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BusinessClaimCartService } from './business-claim-cart.service';
import { CreateBusinessClaimCartDto } from './create-business-claim-cart.dto';
import { UpdateBusinessClaimCartDto } from './update-business-claim-cart.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserSession } from 'src/auth/user.decorator';

@Controller('business-claim-cart')
export class BusinessClaimCartController {
  constructor(private readonly service: BusinessClaimCartService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(
    @UserSession() user: any,
    @Body() dto: CreateBusinessClaimCartDto,
  ) {
    return await this.service.create(user.id, dto);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @UserSession() user: any,
    @Body() dto: UpdateBusinessClaimCartDto,
  ) {
    return await this.service.update(id, user.id, dto);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @UserSession() user: any,
  ) {
    return await this.service.delete(id, user.id);
  }

  @Get('my-cart')
  @UseGuards(JwtAuthGuard)
  async myCart(@UserSession() user: any) {
    return await this.service.findByUser(user.id);
  }

  @Get('list')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
