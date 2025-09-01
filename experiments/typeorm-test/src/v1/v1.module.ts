import { Module } from '@nestjs/common';
import { InstitutionsModule } from './institutions/institutions.module';
import { SchoolsModule } from './schools/schools.module';
import { ClassroomsModule } from './classrooms/classrooms.module';

@Module({
  imports: [InstitutionsModule, SchoolsModule, ClassroomsModule],
})
export class V1Module {}
