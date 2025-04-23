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

describe('TaskModule - updateTask', () => {
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

  it(`PATCH - v1/tasks/:id should throw unauthorized if user is not authenticated`, async () => {
    await request(app.getHttpServer()).patch('/v1/tasks/sometask').expect(401);
  });

  it(`PATCH - v1/tasks/:id should update an existing task`, async () => {
    const mockCreateTaskDto = {
      title: 'Test Task',
      description: 'This is a test task',
      dueDate: new Date(),
    };

    const loginRes = await signInForTest(authService, {
      email: 'email@email.com',
      password: 'password',
    });

    const task = await taskController.createTask(mockCreateTaskDto, {
      email: loginRes.user.email,
      id: loginRes.user.id,
    });

    const mockUpdateTaskDto = {
      title: 'Updated Task',
      description: 'This is an updated test task',
    };

    const res = await request(app.getHttpServer())
      .patch(`/v1/tasks/${task.id}`)
      .set('Authorization', `Bearer ${loginRes.access_token}`)
      .send(mockUpdateTaskDto)
      .expect(200);

    const expectedTask = {
      ...task,
      title: mockUpdateTaskDto.title,
      description: mockUpdateTaskDto.description,
      dueDate: task.dueDate?.toISOString(),
      createdAt: task.createdAt?.toISOString(),
    };

    expect(res.body).toEqual(expectedTask);
  });

  it(`PATCH - v1/tasks/:id should throw not found if task is not found`, async () => {
    const loginRes = await signInForTest(authService, {
      email: 'email@email.com',
      password: 'password',
    });

    const res = await request(app.getHttpServer())
      .patch(`/v1/tasks/sometask`)
      .set('Authorization', `Bearer ${loginRes.access_token}`)
      .expect(404);

    expect(res.body.message).toEqual('task-not-found');
  });

  it(`PATCH - v1/tasks/:id should throw error if fields are invalid`, async () => {
    const loginRes = await signInForTest(authService, {
      email: 'email@email.com',
      password: 'password',
    });

    const res = await request(app.getHttpServer())
      .patch('/v1/tasks/sometask')
      .set('Authorization', `Bearer ${loginRes.access_token}`)
      .send({
        title: 123,
        description: 123,
        dueDate: 'invalid-date',
      })
      .expect(400);

    const errors = res.body.message as string[];

    expect(errors.includes('title must be a string')).toBe(true);
    expect(errors.includes('description must be a string')).toBe(true);
    expect(
      errors.includes('dueDate must be a valid ISO 8601 date string'),
    ).toBe(true);
  });
});
