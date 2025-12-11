import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserSession } from "src/auth/user.decorator";

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

    @Get('getnotification')
    @UseGuards(JwtAuthGuard)
    async getNotifications(@UserSession() user: any) {
        return this.notificationService.getNotifications(user.id);
    }

    @Patch('read/:id')
    @UseGuards(JwtAuthGuard)
    async markAsRead(
        @Param('id') id: string) {
        await this.notificationService.markAsRead(id);
        return { status: 'ok', message: 'Notification marked as read successfully' }
    }
}