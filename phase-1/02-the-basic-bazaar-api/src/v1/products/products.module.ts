import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { AuthorizationModule } from 'src/_shared/authorization/authorization.module';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';

@Module({
  imports: [AuthorizationModule, PrismaDatabaseModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
