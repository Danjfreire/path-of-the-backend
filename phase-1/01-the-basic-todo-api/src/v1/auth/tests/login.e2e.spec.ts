/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthModule } from '../auth.module';
import * as request from 'supertest';
import { CreateUserDTO } from '../dto/register-user.dto';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaTestUtils } from 'src/_shared/test-utils/prisma-db-test.util';
import { PrismaService } from 'src/_shared/prisma-database/prisma.service';
import { AuthController } from '../auth.controller';
import { isJWT } from 'class-validator';

describe('AuthModule - CreateUser', () => {
  let app: INestApplication;
  let prismaUtils: PrismaTestUtils;
  let authController: AuthController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaDatabaseModule, ConfigModule, AuthModule],
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

    authController = moduleRef.get<AuthController>(AuthController);
  });

  afterEach(async () => {
    await prismaUtils.cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`POST - v1/auth/login should login user successfully`, async () => {
    const mockCreateUserDto: CreateUserDTO = {
      name: 'John Doe',
      email: 'john@email.com',
      password: 'safepassword',
    };

    await authController.createUser(mockCreateUserDto);

    const response = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: mockCreateUserDto.email,
        password: mockCreateUserDto.password,
      })
      .expect(201);

    expect(response.body.access_token).toBeDefined();
    expect(isJWT(response.body.access_token)).toBe(true);
  });

  it(`POST - v1/auth/login should throw bad request if email is invalid`, async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: 'not an email',
        password: 'supersafepassword',
      })
      .expect(400);

    expect(response.body.message).toEqual(['email must be an email']);
  });

  it(`POST - v1/auth/login should throw unauthorized if credentials don't match`, async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: 'email@email.com',
        password: '123456',
      })
      .expect(401);

    expect(response.body.message).toBe('invalid-credentials');
  });
});
