import { Controller, Get, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('v1/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const notifications = await this.notificationService.getNotifications({
      page: page ? Number(page) : 0,
      limit: limit ? Number(limit) : 10,
    });

    return notifications;
  }
}
