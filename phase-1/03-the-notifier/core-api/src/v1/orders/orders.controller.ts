import { Controller, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from 'src/_shared/authorization/guards/auth.guard';
import { Roles } from 'src/_shared/authorization/decorators/roles.decorator';
import { ReqUser } from 'src/_shared/authorization/decorators/user.decorator';
import { TokenPayload } from '../auth/models/token-payload';

@UseGuards(AuthGuard)
@Controller('v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles('USER')
  @Post()
  async createOrder(@ReqUser() user: TokenPayload) {
    const order = await this.ordersService.createOrder(user.sub);

    return order;
  }
}
