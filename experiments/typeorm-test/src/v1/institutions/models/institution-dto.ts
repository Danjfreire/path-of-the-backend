import { IsString } from 'class-validator';
import { Institution } from './institution.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateInstitutionDTO {
  @IsString()
  name: string;
}

export class UpdateInstitutionDTO extends PartialType(CreateInstitutionDTO) {}

export class InstitutionResponseDTO {
  name: string;
  id: number;

  constructor(institution: Institution) {
    this.id = institution.id;
    this.name = institution.name;
  }
}
