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
import { isJWT } from 'class-validator';

describe('AuthModule - LoginUser', () => {
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

  it(`POST - v1/auth/login should login a user`, async () => {
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

    expect(isJWT(response.body.access_token)).toBe(true);
  });

  it(`POST - v1/auth/login should throw error if user is not found`, async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'someuser@email.com', password: 'safepassword' })
      .expect(401);

    expect(response.body.message).toEqual('invalid-credentials');
  });
});
