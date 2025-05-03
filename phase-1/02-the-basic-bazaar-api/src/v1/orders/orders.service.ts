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

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }
}
