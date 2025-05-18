import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/_shared/prisma-database/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createNotification(data: {
    userId: string;
    userContact: { email: string };
    orderId: string;
    type: string;
  }) {
    await this.prismaService.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        userEmail: data.userContact.email,
        orderId: data.orderId,
      },
    });
  }
}
