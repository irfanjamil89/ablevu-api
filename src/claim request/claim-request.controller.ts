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
import { ClaimRequestService } from './claim-request.service';
import { CreateClaimRequestDto } from './create-claim-request.dto';
import { UpdateClaimRequestDto } from './update-claim-request.dto';
import {JwtAuthGuard} from 'src/auth/jwt-auth.guard';
import {UserSession} from 'src/auth/user.decorator';

@Controller('claim-request')
export class ClaimRequestController {
  constructor(private readonly service: ClaimRequestService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(
    @UserSession() user: any,
    @Body() dto: CreateClaimRequestDto) 
    {

    return await this.service.create(user.id, dto);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @UserSession() user: any,
    @Body() dto: UpdateClaimRequestDto,
  ) {
    return await this.service.update(id, user.id, dto);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @UserSession() user: any,
    ) {
    return await this.service.delete(id,user.id);
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
