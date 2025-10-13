import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [AuthService, LocalStrategy],
  imports: [UserModule, PassportModule,JwtModule.register({
      secret: 'qlwN95Q3BKVdu',
      signOptions: { expiresIn: '3600s' },
    }),],
  controllers: [AuthController],
})
export class AuthModule {}
