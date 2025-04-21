import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDTO } from './dto/create-task.dto';
import { Task } from 'generated/prisma';
import { UpdateTaskDTO } from './dto/update-task.dto';

@Controller('v1/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll() {
    const tasks = await this.tasksService.findAllTasks('test');

    return tasks;
  }

  @Get('/:id')
  async findTask(@Param('id') taskId: string) {
    const task = await this.tasksService.findTask('test', taskId);

    return task;
  }

  @Post()
  async createTask(@Body() dto: CreateTaskDTO): Promise<Task> {
    const task = await this.tasksService.createTask('test', dto);

    return task;
  }

  @Patch('/:id')
  async updateTask(@Param('id') taskId: string, @Body() dto: UpdateTaskDTO) {
    const task = await this.tasksService.updateTask('test', taskId, dto);

    if (!task) {
      throw new NotFoundException('task-not-found');
    }

    return task;
  }

  @Delete()
  async deleteTask() {}
}
