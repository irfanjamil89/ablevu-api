import { Controller, Get, Post, UseGuards, Request, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AppService } from '../app.service';
import { UsersService } from 'src/services/user.service';
import { User } from 'src/entity/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/logout')
  async logout(@Request() req) {
    return req.logout();
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    const { token, newPassword } = body;
    return this.authService.resetPasswordByToken(token, newPassword); 
  }

  @Post('admin/send-reset')
  @HttpCode(HttpStatus.OK)
  async sendresetlink(@Body() body: { targetEmail: string }) {
    return this.authService.sendresetlink(body.targetEmail);
  }
}


