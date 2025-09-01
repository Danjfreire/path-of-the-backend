import { IsNumber, IsString } from 'class-validator';
import { School } from './school.entity';

export class CreateSchoolDTO {
  @IsString()
  name: string;

  @IsNumber()
  institutionId: number;
}

export class SchoolResponseDTO {
  id: number;
  name: string;
  institutionId: number;

  constructor(school: School) {
    this.id = school.id;
    this.name = school.name;
    this.institutionId = school.institutionId;
  }
}
