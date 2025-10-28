import { Controller, Get, Post, UseGuards, Request, Patch, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from '../app.service';
import { UsersService } from 'src/services/user.service';
import { User } from 'src/entity/user.entity';
import { UserDto } from './user.dto';
import { UpdatePasswordDto } from 'src/user/update-password.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService,
    private readonly users: UsersService
  ) {}

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

@UseGuards(AuthGuard('local'))
  @Patch('update-password')
  async updatePassword(@Request() req: any, @Body() dto: UpdatePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new Error('New password and confirm password did not match');
    }
      const userId = req.user.id;
    await this.users.updatePassword(userId,dto);
    return { status: 'ok', message: 'Password updated successfully'};
  }
  
}
