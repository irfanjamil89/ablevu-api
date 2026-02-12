import { Controller, Get, Post, UseGuards, Request, Patch, Body, HttpCode, HttpStatus, Put, Param, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  @Get('me/:id')
@UseGuards(JwtAuthGuard)
async findOne(@Param('id') id: string): Promise<User> {
  const user = await this.userService.findOneById(id);
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user;
}
  
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async find(@Param('id') id: string, @UserSession() user : any): Promise<User> {
    
    return await this.userService.findOne(user.id) || new User();
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

  @Patch('update-password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @UserSession() user : any,
    @Body() dto: UpdatePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new Error('New password and confirm password did not match');
    }
    const userId = user.id;
    await this.users.updatePassword(userId,dto);
    return { status: 'ok', message: 'Password updated successfully'};
  }

  @Patch('change-role')
  @UseGuards(JwtAuthGuard)
  async updateUserRole( 
    @UserSession() user : any,
    @Body('newRole') newRole: string) {
    const userId = user.id;
    await this.users.updateUserRole(userId, newRole);
    return { status: 'ok', message: 'User role changed successfully' };
  }
  // ✅ Admin: Update ANY user profile
  @Put(':id/update-profile-admin')
  @UseGuards(JwtAuthGuard)
  async updateProfileAdmin(
    @Param('id') userId: string,
    @Body() dto: {
      first_name?: string;
      last_name?: string;
      email?: string;
    },
  ) {
    const user = await this.users.updateProfileAdmin(userId, dto);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ✅ Admin: Change ANY user role
  @Patch(':id/change-role-admin')
  @UseGuards(JwtAuthGuard)
  async changeUserRoleAdmin(
    @Param('id') userId: string,
    @Body('newRole') newRole: 'Contributor' | 'Business' | 'User',
  ) {
    const updated = await this.users.changeUserRoleAdmin(userId, newRole);
    if (!updated) throw new NotFoundException('User not found');

    return {
      status: 'ok',
      message: 'User role changed successfully',
    };
}
@Patch(':id/account-status')
@UseGuards(JwtAuthGuard)
async updateAccountStatus(
  @Param('id') targetUserId: string,
  @Body() body: { status: 'Active' | 'Inactive' | 'Suspended'; reason?: string },
  @UserSession() currentUser: any,
) {

  // ✅ ROLE CHECK HERE (No AdminGuard file needed)
  if ((currentUser?.user_role || '').toLowerCase() !== 'admin') {
    throw new ForbiddenException('Admin only');
  }

  return this.users.setAccountStatusAdmin(
    targetUserId,
    body.status as any,
    body.reason,
  );
}

}
