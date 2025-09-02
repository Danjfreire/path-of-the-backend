import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { V1Module } from './v1/v1.module';
import { dbSourceOptions } from 'data-source';

@Module({
  imports: [TypeOrmModule.forRoot(dbSourceOptions), V1Module],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
