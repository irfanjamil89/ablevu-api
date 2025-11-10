import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, configService } from 'src/services/config.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from 'src/services/user.service';

@Module({
  providers: [AuthService, LocalStrategy,JwtStrategy, ConfigService],
  imports: [UserModule, PassportModule,JwtModule.register({
      secret: process.env.Jwt_Secret || '' ,
      signOptions: { expiresIn: '3600s' },
    })],
  controllers: [AuthController],
})
export class AuthModule {}
