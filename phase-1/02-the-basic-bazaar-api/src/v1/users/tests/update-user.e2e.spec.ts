/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaTestUtils } from 'src/_shared/test-utils/prisma-db-test.util';
import { PrismaService } from 'src/_shared/prisma-database/prisma.service';
import { UsersModule } from '../users.module';
import { signInForTest } from 'src/_shared/test-utils/signin-for-test.util';
import { AuthService } from 'src/v1/auth/auth.service';
import { AuthModule } from 'src/v1/auth/auth.module';

describe('UserModule - updateUser', () => {
  let app: INestApplication;
  let prismaUtils: PrismaTestUtils;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule, AuthModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prismaUtils = new PrismaTestUtils(
      moduleRef.get<PrismaService>(PrismaService),
    );

    authService = moduleRef.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    await prismaUtils.clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`PATCH - v1/users/:id a user should be able to update themselves`, async () => {
    const res = await signInForTest(authService, {
      name: 'John Doe',
      role: 'USER',
      email: 'john@email.com',
      password: '123456',
    });

    const response = await request(app.getHttpServer())
      .patch(`/v1/users/${res.user.id}`)
      .set('Authorization', `Bearer ${res.access_token}`)
      .send({ name: 'John Doe Updated' })
      .expect(200);

    expect(response.body.id).toEqual(res.user.id);
    expect(response.body.email).toEqual(res.user.email);
    expect(response.body.role).toEqual(res.user.role);
    expect(response.body.name).toEqual('John Doe Updated');
    expect(response.body.password).toBeUndefined();
  });

  it(`PATCH - v1/users/:id an admin should be able to update any user`, async () => {
    const mockCreateUserDto = {
      name: 'John Doe',
      email: 'john@email.com',
      password: '123456',
    };
    const user = await authService.createUser(mockCreateUserDto);
    const res = await signInForTest(authService, {
      role: 'ADMIN',
      email: 'admin@email.com',
      password: 'admin123',
    });

    const response = await request(app.getHttpServer())
      .patch(`/v1/users/${user.id}`)
      .set('Authorization', `Bearer ${res.access_token}`)
      .send({ name: 'John Doe Updated' })
      .expect(200);

    expect(response.body.id).toEqual(user.id);
    expect(response.body.email).toEqual(user.email);
    expect(response.body.role).toEqual(user.role);
    expect(response.body.name).toEqual('John Doe Updated');
    expect(response.body.password).toBeUndefined();
  });

  it(`PATCH - v1/users/:id a user should not be able to update other user`, async () => {
    const mockCreateUserDto = {
      name: 'John Doe',
      email: 'john@email.com',
      password: '123456',
    };
    const user = await authService.createUser(mockCreateUserDto);
    const res = await signInForTest(authService, {
      role: 'USER',
      email: 'userx@email.com',
      password: 'user123',
    });

    await request(app.getHttpServer())
      .patch(`/v1/users/${user.id}`)
      .set('Authorization', `Bearer ${res.access_token}`)
      .send({ name: 'John Doe Updated' })
      .expect(403);
  });

  it(`PATCH - v1/users/:id should throw error if user cannot be found`, async () => {
    const res = await signInForTest(authService, {
      role: 'ADMIN',
      email: 'admin@email.com',
      password: 'admin123',
    });

    await request(app.getHttpServer())
      .patch(`/v1/users/someUser`)
      .set('Authorization', `Bearer ${res.access_token}`)
      .send({ name: 'John Doe Updated' })
      .expect(404);
  });

  it(`PATCH - v1/users/:id should throw error if requester is not authenticated`, async () => {
    await request(app.getHttpServer()).patch(`/v1/users/someUser`).expect(401);
  });
});
