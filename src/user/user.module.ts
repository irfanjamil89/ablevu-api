import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AppService } from 'src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/Repository/user.repository';
import { UsersService } from 'src/services/user.service';
import { User } from 'src/entity/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [UserController],
    providers: [AppService,UsersService],
    exports: [UsersService],
})
export class UserModule {}
