/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../auth.module';
import * as request from 'supertest';
import { CreateUserDTO } from '../dto/register-user.dto';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from '../auth.controller';
import { PrismaTestUtils } from 'src/_shared/test-utils/prisma-db-test.util';
import { PrismaService } from 'src/_shared/prisma-database/prisma.service';
import { isUUID } from 'class-validator';

describe('AuthModule - CreateUser', () => {
  let app: INestApplication;
  let prismaUtils: PrismaTestUtils;
  let authController: AuthController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaDatabaseModule, ConfigModule, AuthModule],
    }).compile();

    app = moduleRef.createNestApplication();
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

  it(`POST - v1/auth/singup should create a user`, async () => {
    const mockCreateUserDto: CreateUserDTO = {
      name: 'John Doe',
      email: 'john@email.com',
      password: 'safepassword',
    };

    const response = await request(app.getHttpServer())
      .post('/v1/auth/signup')
      .send(mockCreateUserDto)
      .expect(201);

    expect(isUUID(response.body.id)).toBe(true);
    expect(response.body.name).toEqual(mockCreateUserDto.name);
    expect(response.body.email).toEqual(mockCreateUserDto.email);
    expect(response.body.role).toEqual('USER');
    expect(response.body.password).not.toBeDefined();
  });

  it(`POST - v1/auth/signup should throw conflict error if trying to create user with an email that already exists`, async () => {
    const mockCreateUserDto: CreateUserDTO = {
      name: 'John Doe',
      email: 'john@email.com',
      password: 'safepassword',
    };

    await authController.createUser(mockCreateUserDto);

    const response = await request(app.getHttpServer())
      .post('/v1/auth/signup')
      .send(mockCreateUserDto)
      .expect(409);

    expect(response.body.message).toEqual('email-already-exists');
  });
});
