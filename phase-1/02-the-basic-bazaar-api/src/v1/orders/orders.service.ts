import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async createOrder(
    userId: string,
    idempotencyKey: string,
    createOrderDto: CreateOrderDto,
  ) {
    try {
      return await this.ordersRepository.createOrder(
        userId,
        idempotencyKey,
        createOrderDto,
      );
    } catch {
      return null;
    }
  }

  async findAllUserOrders(
    userId: string,
    options: { page: number; limit: number },
  ) {
    return await this.ordersRepository.findAllUserOrders(userId, options);
  }

  async findOrder(userId: string, orderId: string) {
    return await this.ordersRepository.findOrder(userId, orderId);
  }
}
