import { Controller, Get, Post, UseGuards, Request, Body, HttpCode, HttpStatus, Put, Param } from '@nestjs/common';
import { AppService } from '../app.service';
import { UsersService } from 'src/services/user.service';
import { User } from 'src/entity/user.entity';
import { UserDto } from './user.dto';
import { UpdateProfileDto } from 'src/user/dto/update-profile.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    this.userService.save();
    return await this.userService.findAll();
  }

@Post('signup')
@HttpCode(HttpStatus.CREATED)
async signUp(@Body() dto: UserDto) {
  return await this.userService.signUp(dto);
}
@Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(id, updateProfileDto);
  }

  
}
