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
import { TasksService } from '../tasks.service';

describe('TaskModule - deleteTask', () => {
  let app: INestApplication;
  let prismaUtils: PrismaTestUtils;
  let authService: AuthService;
  let taskController: TasksController;
  let taskService: TasksService;

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
    taskService = moduleRef.get<TasksService>(TasksService);
  });

  afterEach(async () => {
    await prismaUtils.cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`DELETE - v1/tasks/:id should throw unauthorized if user is not authenticated`, async () => {
    await request(app.getHttpServer()).get('/v1/tasks/sometask').expect(401);
  });

  it(`DELETE - v1/tasks/:id should delete a task`, async () => {
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

    await request(app.getHttpServer())
      .delete(`/v1/tasks/${task.id}`)
      .set('Authorization', `Bearer ${loginRes.access_token}`)
      .expect(200);

    const taskAfterDeletion = await taskService.findTask(
      loginRes.user.id,
      task.id,
    );

    expect(taskAfterDeletion).toBeNull();
  });

  it(`DELETE - v1/tasks/:id should throw not found if task is not found`, async () => {
    const loginRes = await signInForTest(authService, {
      email: 'email@email.com',
      password: 'password',
    });

    const res = await request(app.getHttpServer())
      .delete(`/v1/tasks/sometask`)
      .set('Authorization', `Bearer ${loginRes.access_token}`)
      .expect(404);

    expect(res.body.message).toEqual('task-not-found');
  });
});
