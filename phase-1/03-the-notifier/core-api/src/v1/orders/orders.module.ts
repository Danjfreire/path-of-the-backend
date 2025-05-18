import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRespository } from './orders.repository';
import { AuthorizationModule } from 'src/_shared/authorization/authorization.module';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    PrismaDatabaseModule,
    AuthorizationModule,
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@rabbitmq:5672'],
          queue: 'notifications',
        },
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRespository],
})
export class OrdersModule {}
