import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [AuthService, LocalStrategy,JwtStrategy, ConfigService],
  imports: [UserModule, PassportModule,JwtModule.registerAsync({
     imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET missing');
    return { secret, signOptions: { expiresIn: '1d' } };
  }
    })],
  controllers: [AuthController],
})
export class AuthModule {}
