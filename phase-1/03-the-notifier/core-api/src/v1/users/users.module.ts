import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';
import { AuthorizationModule } from 'src/_shared/authorization/authorization.module';

@Module({
  imports: [PrismaDatabaseModule, AuthorizationModule],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UsersModule {}
