import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { School } from './models/school.entity';
import { Repository } from 'typeorm';
import { CreateSchoolDTO, SchoolResponseDTO } from './models/school-dto';
import { Institution } from '../institutions/models/institution.entity';

@Controller('v1/schools')
export class SchoolsController {
  constructor(
    @InjectRepository(School)
    private schoolRepo: Repository<School>,

    @InjectRepository(Institution)
    private institutionRepo: Repository<Institution>,
  ) {}

  @Post()
  async createSchool(@Body() body: CreateSchoolDTO) {
    const institution = await this.institutionRepo.findOneBy({
      id: body.institutionId,
    });

    if (!institution) {
      throw new NotFoundException(
        `institution not found with id ${body.institutionId}`,
      );
    }

    const school = new School();
    school.name = body.name;
    school.institution = institution;

    const createdSchool = await this.schoolRepo.save(school);
    return new SchoolResponseDTO(createdSchool);
  }

  @Get()
  async listSchools(@Query('institutionId') institutionId?: number) {
    const schools = await this.schoolRepo.find({
      where: institutionId ? { institutionId } : {},
    });

    return schools.map((school) => new SchoolResponseDTO(school));
  }
}
