import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationHandlerController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('order.notification')
  async handleOrderNotification(
    @Payload() data: Record<string, any>,
    @Ctx() context: RmqContext,
  ) {
    const originalMessage = context.getMessage();
    const channel = context.getChannelRef();

    //  validate the input data
    const userId = data.userId;
    const userContact = data.userContact;
    const orderId = data.orderId;

    if (!userId || !userContact || !orderId) {
      channel.nack(originalMessage, false, true);
      console.error('Invalid data received:', data);
      return;
    }

    await this.notificationService.createEmailNotification({
      userId,
      userContact,
      orderId,
    });

    channel.ack(originalMessage);
  }
}
