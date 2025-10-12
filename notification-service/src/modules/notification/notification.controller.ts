import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  async sendNotification(
    @Body() body: { deviceToken: string; title: string; message: string },
  ) {
    const { deviceToken, title, message } = body;
    return this.notificationService.sendPushNotification(deviceToken, title, message);
  }
}
