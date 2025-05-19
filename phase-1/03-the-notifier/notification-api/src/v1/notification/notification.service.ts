import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async createEmailNotification(data: {
    userId: string;
    userContact: { email: string };
    orderId: string;
  }) {
    // This method is a placeholder for creating email notifications.
    // You can implement the logic to create email notifications here.
    // For example, you might want to send an email using a third-party service.
    // For now, we'll just log a message to the console.
    console.log('Creating email notification...');

    await this.notificationRepository.createNotification({
      orderId: data.orderId,
      type: 'email',
      userId: data.userId,
      userContact: {
        email: data.userContact.email,
      },
    });
  }

  async getNotifications(options: { page: number; limit: number }) {
    return await this.notificationRepository.getNotifications(options);
  }
}
