import { Module } from '@nestjs/common';
import { InstitutionsModule } from './institutions/institutions.module';

@Module({
  imports: [InstitutionsModule],
})
export class V1Module {}
