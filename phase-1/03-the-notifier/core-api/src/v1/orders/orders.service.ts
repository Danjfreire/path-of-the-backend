import { Inject, Injectable } from '@nestjs/common';
import { OrdersRespository } from './orders.repository';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRespository,
    @Inject('NOTIFICATION_SERVICE') private readonly client: ClientProxy,
  ) {}

  async createOrder(userId: string) {
    const order = await this.ordersRepository.createOrder(userId);

    const payload = { orderId: order.id, userId: order.userId };
    this.client.emit('order.notification', payload);

    return order;
  }
}
