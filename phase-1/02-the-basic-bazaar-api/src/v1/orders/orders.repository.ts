import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/_shared/prisma-database/prisma.service';
import { Order } from 'generated/prisma';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createOrder(
    userId: string,
    idempotencyKey: string,
    createOrderDto: CreateOrderDto,
  ) {
    const { itemIds } = createOrderDto;

    return await this.prismaService.$transaction(async (t) => {
      // check if the order was already made with the same idempotency key
      const existingOrder = await t.idempotencyRequest.findUnique({
        where: {
          key: idempotencyKey,
          userId,
        },
      });

      if (existingOrder) {
        return existingOrder.response as unknown as Order;
      }

      const products = await t.product.findMany({
        where: {
          id: {
            in: itemIds,
          },
        },
      });

      const allProductsAvailable =
        products.length === itemIds.length &&
        products.every((product) => product.isAvailable && !product.deletedAt);

      if (!allProductsAvailable) {
        throw new Error('products-unavailable');
      }

      const totalPrice = products.reduce(
        (acc, product) => acc + product.price,
        0,
      );

      const orderItems = products.map((product) => ({
        productId: product.id,
        purchasePrice: product.price,
      }));

      // make products unavailable
      await t.product.updateMany({
        where: {
          id: {
            in: itemIds,
          },
        },
        data: {
          isAvailable: false,
        },
      });

      // create the order and the order items
      const order = await t.order.create({
        data: {
          userId,
          totalPrice,
          orderItems: {
            create: orderItems,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      await t.idempotencyRequest.create({
        data: {
          key: idempotencyKey,
          userId,
          response: order,
        },
      });

      return order;
    });
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }
}
