import { Module } from '@nestjs/common';
import { V1Module } from './v1/v1.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaDatabaseModule } from './_shared/prisma-database/prisma-database.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaDatabaseModule,
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1h',
      },
    }),
    V1Module,
  ],
})
export class AppModule {}
