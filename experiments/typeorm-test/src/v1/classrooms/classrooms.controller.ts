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
import { Classroom } from './models/classroom.entity';
import { Repository } from 'typeorm';
import {
  ClassroomResponseDTO,
  CreateClassroomDTO,
  UpdateClassroomDTO,
} from './models/classroom.dto';
import { School } from '../schools/models/school.entity';

@Controller('v1/classrooms')
export class ClassroomsController {
  constructor(
    @InjectRepository(Classroom)
    private classroomRepo: Repository<Classroom>,

    @InjectRepository(School)
    private schoolRepo: Repository<School>,
  ) {}

  @Post()
  async createClassroom(@Body() body: CreateClassroomDTO) {
    const school = await this.schoolRepo.findOneBy({ id: body.schoolId });

    if (school == null) {
      throw new NotFoundException(`school not found with id ${body.schoolId}`);
    }

    const classroom = new Classroom();
    classroom.code = body.code;
    classroom.name = body.name;
    classroom.school = school;

    const createdClassroom = await this.classroomRepo.save(classroom);
    return new ClassroomResponseDTO(createdClassroom);
  }

  @Get()
  async listClassrooms(
    @Query('limit') limit = 10,
    @Query('cursor') cursor?: number,
  ) {
    const classrooms = await this.classroomRepo
      .createQueryBuilder('classroom')
      .take(limit)
      .where('classroom.id > :cursor', { cursor: cursor ?? 0 })
      .orderBy('classroom.id', 'ASC')
      .getMany();

    let nextCursor: number | null = null;
    if (classrooms.length === +limit) {
      nextCursor = classrooms[classrooms.length - 1].id;
    }

    return {
      data: classrooms.map((c) => new ClassroomResponseDTO(c)),
      next_cursor: nextCursor,
    };
  }

  @Get(':id')
  async getClassroom(@Param('id') id: number) {
    const classroom = await this.classroomRepo.findOneBy({ id });

    if (!classroom) {
      throw new NotFoundException(`classroom not found with id ${id}`);
    }

    return new ClassroomResponseDTO(classroom);
  }

  @Patch(':id')
  async updateClassroom(
    @Param('id') id: number,
    @Body() body: UpdateClassroomDTO,
  ) {
    const classroom = await this.classroomRepo.findOneBy({ id });

    if (!classroom) {
      throw new NotFoundException(`classroom not found with id ${id}`);
    }

    classroom.name = body.name ?? classroom.name;
    classroom.code = body.code ?? classroom.code;

    const updatedClassroom = await this.classroomRepo.save(classroom);
    return new ClassroomResponseDTO(updatedClassroom);
  }
}
