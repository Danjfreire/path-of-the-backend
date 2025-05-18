import { Controller, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from 'src/_shared/authorization/guards/auth.guard';
import { Roles } from 'src/_shared/authorization/decorators/roles.decorator';
import { ReqUser } from 'src/_shared/authorization/decorators/user.decorator';
import { TokenPayload } from '../../_shared/authorization/token-payload';
import { UserRole } from 'src/_shared/authorization/roles.model';

@UseGuards(AuthGuard)
@Controller('v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(UserRole.USER)
  @Post()
  async createOrder(@ReqUser() user: TokenPayload) {
    const order = await this.ordersService.createOrder(user.sub);

    return order;
  }
}
