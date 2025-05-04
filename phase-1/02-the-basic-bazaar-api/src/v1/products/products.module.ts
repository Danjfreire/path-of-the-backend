import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { AuthorizationModule } from 'src/_shared/authorization/authorization.module';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    AuthorizationModule,
    PrismaDatabaseModule,
    CacheModule.registerAsync({
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async () => {
        return {
          stores: [
            createKeyv(
              `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
            ),
          ],
        };
      },
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
