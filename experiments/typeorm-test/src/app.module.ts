import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { V1Module } from './v1/v1.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Institution } from './v1/institutions/models/institution.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'postgres',
      entities: [Institution],
      synchronize: true,
      namingStrategy: new SnakeNamingStrategy(),
    }),
    V1Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
