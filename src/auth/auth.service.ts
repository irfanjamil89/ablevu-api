import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from 'src/services/user.service';
import * as bcrypt from 'bcrypt';
import { log } from 'console';
import { PassThrough } from 'stream';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { sendResetEmail } from 'src/shared/mailer';


@Injectable()
export class AuthService {
  constructor(private usersService: UsersService,  private jwtService: JwtService) {}

  private makeFrontendLink(token: string, email: string): string {
    const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:3001').trim();
    const url = new URL('/reset-password', baseUrl);
    url.searchParams.set('token', token);
    url.searchParams.set('email', email);
    return url.toString();
  }
  private async processResetPasswordFlow(
    userEmail: string,
    userName: string | null | undefined,
    expiryMs: number,
    subject: string,
    expiryLabel: string,
  ) {
    // You log in by username = email, so reuse the same finder:
    const user = await this.usersService.findByUserName(userEmail);
    if (!user) throw new BadRequestException('No user found for the provided email');
    
    if (!user.email) throw new BadRequestException('User has no email configured');

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + expiryMs);

    // these fields must exist on your User entity (see entity snippet below)
    user.resetToken = token;
    user.resetTokenExpires = expires;
    await this.usersService.save(user);

    const link = this.makeFrontendLink(token, user.email);

    try {
      await sendResetEmail({
        to: user.email,
        name: userName || user.first_name || user.last_name || 'User',
        resetLink: link,
        expiryText: expiryLabel,
        subject: 'Reset your Ablevu account password',
      });
      return { status: 'Success', message: `Reset link has been sent to ${user.email}` };
    } catch (e: any) {
      user.resetToken = null as any;
      user.resetTokenExpires = null as any;
      await this.usersService.save(user);
      throw new BadRequestException('Failed to send reset email');
    }
  }

  public async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUserName(username);
    const saltOrRounds = 12;
const valid = await bcrypt.compare(pass, user?.password);;
console.log(valid)
debugger;
    if (valid) {

      return user;
    }
    return null;
  }

   async login(user: any) {
    console.log(user);
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByUserName(email);
    if (!user) return { status: 'Error', message: 'Email does not exist' };
    if (!user.email) {                          
    throw new BadRequestException('User record has no email');
  }
    return this.processResetPasswordFlow(
      user.email,          
      user.first_name,     
      60 * 60 * 1000,
      'Password Reset Request',
      '1 hour',
    );
  }

  async resetPasswordByToken(token: string, newPassword: string) {
  if (!token || !newPassword) {
    throw new BadRequestException('Token and new password must be provided');
  }

  const user = await this.usersService.findByResetToken(token);
  if (!user) throw new BadRequestException('Invalid reset token');

  // expiry check
  if (!user.resetTokenExpires || user.resetTokenExpires.getTime() < Date.now()) {
    user.resetToken = null;
    user.resetTokenExpires = null;
    await this.usersService.save(user);
    throw new BadRequestException('Reset token has expired');
  }

  // update password
  user.password = await bcrypt.hash(newPassword, 12);
  user.resetToken = null;
  user.resetTokenExpires = null;
  await this.usersService.save(user);

  return { status: 'Success', message: 'Password reset successful' };
}

  async sendresetlink(targetEmail: string) {
    const user = await this.usersService.findByUserName(targetEmail);
    if (!user) return { status: 'Error', message: 'User not found' };
    if (!user.email) {                          
    throw new BadRequestException('User record has no email');
  }

    return this.processResetPasswordFlow(
      user.email,         
      user.first_name,    
      60 * 60 * 1000,
      'Admin initiated password reset',
      '1 hour',
    );
  }
}
