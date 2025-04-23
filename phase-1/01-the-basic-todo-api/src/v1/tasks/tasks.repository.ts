import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
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
  }): Promise<Task | null> {
    try {
      const res = await this.prismaService.task.update({
        where: { id: data.taskId, userId: data.userId },
        data: {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
        },
      });

      return res;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // error P2025 happens when the record to update is not found
        if (error.code === 'P2025') {
          return null;
        }
      }

      console.error(error);
      return null;
    }
  }

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    try {
      await this.prismaService.task.delete({
        where: {
          id: taskId,
          userId: userId,
        },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // error P2025 happens when the record to delete is not found
        if (error.code === 'P2025') {
          return false;
        }
      }

      console.error(error);
      return false;
    }
  }
}
