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

describe('TaskModule - createTask', () => {
  let app: INestApplication;
  let prismaUtils: PrismaTestUtils;
  let authService: AuthService;

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
  });

  afterEach(async () => {
    await prismaUtils.cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`POST - v1/tasks should throw unauthorized if user is not authenticated`, async () => {
    const mockCreateTaskDto = {
      title: 'Test Task',
      description: 'This is a test task',
      dueDate: new Date().toISOString(),
    };

    await request(app.getHttpServer())
      .post('/v1/tasks')
      .send(mockCreateTaskDto)
      .expect(401);
  });

  it(`POST - v1/tasks should create task successfully`, async () => {
    const mockCreateTaskDto = {
      title: 'Test Task',
      description: 'This is a test task',
      dueDate: new Date().toISOString(),
    };

    const loginRes = await signInForTest(authService, {
      email: 'email@email.com',
      password: 'password',
    });

    const res = await request(app.getHttpServer())
      .post('/v1/tasks')
      .set('Authorization', `Bearer ${loginRes.access_token}`)
      .send(mockCreateTaskDto)
      .expect(201);

    const expectedTask = {
      id: expect.any(String),
      title: mockCreateTaskDto.title,
      description: mockCreateTaskDto.description,
      dueDate: mockCreateTaskDto.dueDate,
      status: 'PENDING',
      createdAt: expect.any(String),
      userId: loginRes.user.id,
    };

    expect(res.body).toEqual(expectedTask);
  });

  it(`POST - v1/tasks should throw bad request if fields are invalid`, async () => {
    const loginRes = await signInForTest(authService, {
      email: 'email@email.com',
      password: 'password',
    });

    const res = await request(app.getHttpServer())
      .post('/v1/tasks')
      .set('Authorization', `Bearer ${loginRes.access_token}`)
      .send({})
      .expect(400);

    const errors = res.body.message as string[];

    expect(errors.includes('title must be a string')).toBe(true);
    expect(errors.includes('description must be a string')).toBe(true);
    expect(
      errors.includes('dueDate must be a valid ISO 8601 date string'),
    ).toBe(true);
  });
});
