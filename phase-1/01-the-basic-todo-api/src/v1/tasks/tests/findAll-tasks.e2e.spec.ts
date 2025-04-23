/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaTestUtils } from 'src/_shared/test-utils/prisma-db-test.util';
import { PrismaService } from 'src/_shared/prisma-database/prisma.service';
import { TasksModule } from '../tasks.module';
import { AuthService } from 'src/v1/auth/auth.service';
import { signInForTest } from 'src/_shared/test-utils/signin-for-test.util';
import { TasksController } from '../tasks.controller';

describe('TaskModule - findAllTask', () => {
  let app: INestApplication;
  let prismaUtils: PrismaTestUtils;
  let authService: AuthService;
  let taskController: TasksController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TasksModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();

    prismaUtils = new PrismaTestUtils(
      moduleRef.get<PrismaService>(PrismaService),
    );
    authService = moduleRef.get<AuthService>(AuthService);
    taskController = moduleRef.get<TasksController>(TasksController);
  });

  afterEach(async () => {
    await prismaUtils.cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`GET - v1/tasks should throw unauthorized if user is not authenticated`, async () => {
    await request(app.getHttpServer()).get('/v1/tasks').expect(401);
  });

  it(`GET - v1/tasks should find all user tasks`, async () => {
    const mockCreateTaskDto1 = {
      title: 'Test Task',
      description: 'This is a test task',
      dueDate: new Date(),
    };

    const mockCreateTaskDto2 = {
      title: 'Test Task 2',
      description: 'This is a test task',
      dueDate: new Date(),
    };

    const loginRes = await signInForTest(authService, {
      email: 'email@email.com',
      password: 'password',
    });

    const task1 = await taskController.createTask(mockCreateTaskDto1, {
      email: loginRes.user.email,
      id: loginRes.user.id,
    });

    const task2 = await taskController.createTask(mockCreateTaskDto2, {
      email: loginRes.user.email,
      id: loginRes.user.id,
    });

    const res = await request(app.getHttpServer())
      .get(`/v1/tasks`)
      .set('Authorization', `Bearer ${loginRes.access_token}`)
      .expect(200);

    const expectedTasks = [task1, task2].map((task) => {
      return {
        ...task,
        dueDate: task.dueDate?.toISOString(),
        createdAt: task.createdAt?.toISOString(),
      };
    });

    expect(res.body).toEqual(expectedTasks);
  });

  it(`GET - v1/tasks should return empty array if no tasks are found`, async () => {
    const loginRes = await signInForTest(authService, {
      email: 'email@email.com',
      password: 'password',
    });

    const res = await request(app.getHttpServer())
      .get(`/v1/tasks`)
      .set('Authorization', `Bearer ${loginRes.access_token}`)
      .expect(200);

    expect(res.body).toEqual([]);
  });
});
