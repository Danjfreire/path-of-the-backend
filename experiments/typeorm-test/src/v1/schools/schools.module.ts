import { Module } from '@nestjs/common';
import { SchoolsController } from './schools.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from './models/school.entity';
import { InstitutionsModule } from '../institutions/institutions.module';

@Module({
  imports: [TypeOrmModule.forFeature([School]), InstitutionsModule],
  controllers: [SchoolsController],
  exports: [TypeOrmModule],
})
export class SchoolsModule {}
