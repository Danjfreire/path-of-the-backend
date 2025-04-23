import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDTO } from './dto/create-task.dto';
import { Task } from 'generated/prisma';
import { UpdateTaskDTO } from './dto/update-task.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ReqUser } from '../auth/user.decorator';
import { RequestUser } from '../auth/models/request-user';

@UseGuards(AuthGuard)
@Controller('v1/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAllTasks(@ReqUser() user: RequestUser): Promise<Task[]> {
    const tasks = await this.tasksService.findAllTasks(user.id);

    return tasks;
  }

  @Get('/:id')
  async findTask(
    @Param('id') taskId: string,
    @ReqUser() user: RequestUser,
  ): Promise<Task> {
    const task = await this.tasksService.findTask(user.id, taskId);

    if (!task) {
      throw new NotFoundException('task-not-found');
    }

    return task;
  }

  @Post()
  async createTask(
    @Body() dto: CreateTaskDTO,
    @ReqUser() user: RequestUser,
  ): Promise<Task> {
    const task = await this.tasksService.createTask(user.id, dto);

    return task;
  }

  @Patch('/:id')
  async updateTask(
    @Param('id') taskId: string,
    @Body() dto: UpdateTaskDTO,
    @ReqUser() user: RequestUser,
  ): Promise<Task> {
    const task = await this.tasksService.updateTask(user.id, taskId, dto);

    if (!task) {
      throw new NotFoundException('task-not-found');
    }

    return task;
  }

  @Delete('/:id')
  async deleteTask(@Param('id') taskId: string, @ReqUser() user: RequestUser) {
    const result = await this.tasksService.deleteTask(user.id, taskId);

    if (!result) {
      throw new NotFoundException('task-not-found');
    }
  }
}
