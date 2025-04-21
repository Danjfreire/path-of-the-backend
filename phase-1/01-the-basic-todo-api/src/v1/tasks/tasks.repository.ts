import { Injectable } from '@nestjs/common';
import { Task } from 'generated/prisma';
import { PrismaService } from 'src/_shared/prisma-database/prisma.service';

@Injectable()
export class TasksRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createTask(data: {
    title: string;
    description: string;
    dueDate?: Date;
    userId: string;
  }): Promise<Task> {
    const task = await this.prismaService.task.create({
      data: {
        description: data.description,
        title: data.title,
        dueDate: data.dueDate,
        user: {
          connect: {
            id: data.userId,
          },
        },
      },
    });

    return task;
  }

  async findAllTasks(userId: string): Promise<Task[]> {
    const tasks = await this.prismaService.task.findMany({
      where: {
        userId,
      },
    });

    return tasks;
  }

  async findTaskById(userId: string, taskId: string): Promise<Task | null> {
    const task = await this.prismaService.task.findUnique({
      where: {
        id: taskId,
        userId: userId,
      },
    });

    return task;
  }

  async updateTask(data: {
    taskId: string;
    userId: string;
    title?: string;
    description?: string;
    dueDate?: Date;
  }): Promise<Task> {
    const res = await this.prismaService.task.update({
      where: { id: data.taskId, userId: data.userId },
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
      },
    });

    return res;
  }
}
