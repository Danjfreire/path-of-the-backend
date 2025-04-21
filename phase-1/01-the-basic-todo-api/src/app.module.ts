import { Module } from '@nestjs/common';
import { V1Module } from './v1/v1.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaDatabaseModule } from './_shared/prisma-database/prisma-database.module';

@Module({
  imports: [
    PrismaDatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    V1Module,
  ],
})
export class AppModule {}
