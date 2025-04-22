import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { AuthModule } from '../auth/auth.module';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';

@Module({
  imports: [PrismaDatabaseModule, AuthModule],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
})
export class TasksModule {}
