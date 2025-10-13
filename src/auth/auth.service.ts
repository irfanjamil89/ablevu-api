import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/services/user.service';
import * as bcrypt from 'bcrypt';
import { log } from 'console';
import { PassThrough } from 'stream';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(private usersService: UsersService,  private jwtService: JwtService) {}

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
}
