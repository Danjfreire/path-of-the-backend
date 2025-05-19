import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { isEmail, isString, isUUID } from 'class-validator';

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

    if (!isUUID(userId) || !isEmail(userContact.email) || !isUUID(orderId)) {
      channel.nack(originalMessage, false, true);
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
