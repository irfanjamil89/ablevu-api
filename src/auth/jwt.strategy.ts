
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/services/user.service';
import { User } from 'src/entity/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: UsersService, private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET').toString()
    });
  }

  async validate(payload: any) : Promise<User> {
    console.log('JWT payload:', payload);
    const user = await this.authService.findByUserName(payload.username);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
