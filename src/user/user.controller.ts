import { Controller, Get, Post, UseGuards, Request, Patch, Body, HttpCode, HttpStatus, Put, Param } from '@nestjs/common';
import { UserSession } from "src/auth/user.decorator";
import { UsersService } from 'src/services/user.service';
import { User } from 'src/entity/user.entity';
import { UserDto } from './user.dto';
import { UpdateProfileDto } from 'src/user/dto/update-profile.dto';
import { UpdatePasswordDto } from 'src/user/update-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService,
    private readonly users: UsersService
  ) { }

  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async find(@Param('id') id: string, @UserSession() user : any): Promise<User> {

    return await this.userService.findOne(id) || new User();
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: UserDto) {
    return await this.userService.signUp(dto);
  }

  
  @Put('update-profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @UserSession() user : any,
  ) {
    return this.userService.updateProfile( user.id, dto);
  }

  @Patch('update-password/:id')
  async updatePassword(@Param('id') id: string, @Body() dto: UpdatePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new Error('New password and confirm password did not match');
    }
    const userId = id;
    await this.users.updatePassword(userId,dto);
    return { status: 'ok', message: 'Password updated successfully'};
  }

  @Patch('change-role/:id')
  async updateUserRole( @Param('id') id: string, @Body('newRole') newRole: string) {
      const userId = id;
    await this.users.updateUserRole(userId, newRole);
    return { status: 'ok', message: 'User role changed successfully' };
  }
}
