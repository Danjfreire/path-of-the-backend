import { Injectable } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { CreateTaskDTO } from './dto/create-task.dto';
import { Task } from 'generated/prisma';
import { UpdateTaskDTO } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly taskRepository: TasksRepository) {}

  async createTask(userId: string, dto: CreateTaskDTO): Promise<Task> {
    const task = await this.taskRepository.createTask({
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate,
      userId,
    });

    return task;
  }

  async findAllTasks(userId: string): Promise<Task[]> {
    const tasks = await this.taskRepository.findAllTasks(userId);

    return tasks;
  }

  async findTask(userId: string, taskId: string): Promise<Task | null> {
    const task = await this.taskRepository.findTaskById(userId, taskId);

    if (!task) {
      return null;
    }

    return task;
  }

  async updateTask(
    userId: string,
    taskId: string,
    dto: UpdateTaskDTO,
  ): Promise<Task | null> {
    const task = await this.taskRepository.updateTask({
      userId,
      taskId,
      ...dto,
    });

    return task;
  }

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    return await this.taskRepository.deleteTask(userId, taskId);
  }
}
