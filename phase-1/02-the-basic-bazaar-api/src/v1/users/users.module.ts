import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from './user.repository';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';
import { AuthorizationModule } from 'src/_shared/authorization/authorization.module';

@Module({
  imports: [PrismaDatabaseModule, AuthorizationModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
