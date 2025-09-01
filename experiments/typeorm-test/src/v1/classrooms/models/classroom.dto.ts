import { IsNumber, IsString } from 'class-validator';
import { Classroom } from './classroom.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateClassroomDTO {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsNumber()
  schoolId: number;
}

export class UpdateClassroomDTO extends PartialType(CreateClassroomDTO) {}

export class ClassroomResponseDTO {
  id: number;
  name: string;
  code: string;
  schoolId: number;

  constructor(classroom: Classroom) {
    this.id = classroom.id;
    this.name = classroom.name;
    this.code = classroom.code;
    this.schoolId = classroom.schoolId;
  }
}
