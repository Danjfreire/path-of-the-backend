import { Module } from '@nestjs/common';
import { ClassroomsController } from './classrooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classroom } from './models/classroom.entity';
import { SchoolsModule } from '../schools/schools.module';

@Module({
  imports: [TypeOrmModule.forFeature([Classroom]), SchoolsModule],
  controllers: [ClassroomsController],
})
export class ClassroomsModule {}
