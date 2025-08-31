import { Module } from '@nestjs/common';
import { InstitutionsController } from './institution.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institution } from './models/institution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Institution])],
  controllers: [InstitutionsController],
})
export class InstitutionsModule {}
