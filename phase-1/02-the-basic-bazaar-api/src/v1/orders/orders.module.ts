import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AuthorizationModule } from 'src/_shared/authorization/authorization.module';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';
import { OrdersRepository } from './orders.repository';

@Module({
  imports: [AuthorizationModule, PrismaDatabaseModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
