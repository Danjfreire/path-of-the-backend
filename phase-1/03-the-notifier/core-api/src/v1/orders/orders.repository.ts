import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/_shared/prisma-database/prisma.service';

@Injectable()
export class OrdersRespository {
  constructor(private readonly prismaService: PrismaService) {}

  async createOrder(userId: string) {
    const order = await this.prismaService.order.create({
      data: {
        userId,
      },
    });

    return order;
  }
}
