import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';
import { AuthorizationModule } from 'src/_shared/authorization/authorization.module';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { NotificationHandlerController } from './notification-handler.controller';

@Module({
  imports: [PrismaDatabaseModule, AuthorizationModule],
  controllers: [NotificationController, NotificationHandlerController],
  providers: [NotificationService, NotificationRepository],
})
export class NotificationModule {}
