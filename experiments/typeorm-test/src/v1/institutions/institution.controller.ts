import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Institution } from './models/institution.entity';
import { Repository } from 'typeorm';
import {
  CreateInstitutionDTO,
  InstitutionResponseDTO,
  UpdateInstitutionDTO,
} from './models/institution-dto';

@Controller('v1/institutions')
export class InstitutionsController {
  constructor(
    @InjectRepository(Institution)
    private institutionRepo: Repository<Institution>,
  ) {}

  @Post()
  async createInstitution(@Body() body: CreateInstitutionDTO) {
    const institution = this.institutionRepo.create(body);
    const createdInstitution = await this.institutionRepo.save(institution);

    return new InstitutionResponseDTO(createdInstitution);
  }

  @Get()
  async listInstitutions(
    @Query('limit') limit = 10,
    @Query('cursor') cursor?: string,
  ) {
    const query = this.institutionRepo
      .createQueryBuilder('institution')
      .take(limit)
      .orderBy('institution.id', 'ASC');

    if (cursor) {
      query.where('institution.id > :cursor', { cursor });
    }

    const institutions = await query.getMany();

    let nextCursor: string | null = null;
    if (institutions.length === +limit) {
      nextCursor = institutions[institutions.length - 1].id.toString(); // Assuming 'id' is a number
    }

    return {
      data: institutions.map((i) => new InstitutionResponseDTO(i)),
      next_cursor: nextCursor,
    };
  }

  @Get(':id')
  async getInstitution(@Param('id') id: number) {
    const institution = await this.institutionRepo.findOneBy({ id });

    if (!institution) {
      throw new NotFoundException(`No institution found with given id: ${id}`);
    }

    return new InstitutionResponseDTO(institution);
  }

  @Patch(':id')
  async updateInstitution(
    @Param('id') id: number,
    @Body() body: UpdateInstitutionDTO,
  ) {
    const institution = await this.institutionRepo.findOneBy({ id });

    if (!institution) {
      throw new NotFoundException(`No institution found with given id: ${id}`);
    }

    institution.name = body.name ?? institution.name;

    const updatedInstitution = await this.institutionRepo.save(institution);

    return new InstitutionResponseDTO(updatedInstitution);
  }
}
