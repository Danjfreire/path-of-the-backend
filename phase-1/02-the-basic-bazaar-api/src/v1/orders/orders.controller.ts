import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Headers,
  BadRequestException,
  UnprocessableEntityException,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from 'src/_shared/authorization/guards/auth.guard';
import { Roles } from 'src/_shared/authorization/decorators/roles.decorator';
import { ReqUser } from 'src/_shared/authorization/decorators/user.decorator';
import { TokenPayload } from '../auth/models/token-payload';
import { isUUID } from 'class-validator';

@UseGuards(AuthGuard)
@Controller('v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles('USER')
  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Headers('Idempotency-Key') idempotencyKey: string,
    @ReqUser() user: TokenPayload,
  ) {
    if (!idempotencyKey || !isUUID(idempotencyKey)) {
      throw new BadRequestException(
        'invalid-or-missing-idempotency-key-header',
      );
    }

    const order = await this.ordersService.createOrder(
      user.sub,
      idempotencyKey,
      createOrderDto,
    );

    if (!order) {
      throw new UnprocessableEntityException('failed-to-create-order');
    }

    return order;
  }

  @Roles('USER')
  @Get()
  async findAllUserOrders(
    @ReqUser() user: TokenPayload,
    @Query('page', ParseIntPipe) page: number = 0,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    const orders = await this.ordersService.findAllUserOrders(user.sub, {
      page,
      limit,
    });

    return orders;
  }

  @Roles('USER')
  @Get(':id')
  async findOne(@Param('id') id: string, @ReqUser() user: TokenPayload) {
    const order = await this.ordersService.findOrder(user.sub, id);

    if (!order) {
      throw new NotFoundException('order-not-found');
    }

    return order;
  }
}
