import {} from '@nestjs/common';
import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/entity/notifications.entity';
import { User } from 'src/entity/user.entity';
import { NotificationController } from './notifications.controller';
import { Business } from 'src/entity/business.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Notification, User, Business])],
    providers: [NotificationService],
    controllers: [NotificationController],   
    exports: [NotificationService],
})
export class NotificationModule {}