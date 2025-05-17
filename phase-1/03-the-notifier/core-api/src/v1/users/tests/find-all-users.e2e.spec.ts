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

describe('UserModule - findAllUsers', () => {
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

  it(`GET - v1/users a user should not be able to find all other users`, async () => {
    const res = await signInForTest(authService, {
      role: 'USER',
      email: 'john@email.com',
      password: '123456',
    });

    await request(app.getHttpServer())
      .get(`/v1/users`)
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(403);
  });

  it(`GET - v1/users an admin should be able to find all users`, async () => {
    const mockUser1 = {
      name: 'John Doe',
      email: 'john@email.com',
      password: '123456',
    };

    const mockUser2 = {
      name: 'John Doesnt',
      email: 'johndoesnt@email.com',
      password: '123456',
    };

    await authService.createUser(mockUser1);
    await authService.createUser(mockUser2);

    const res = await signInForTest(authService, {
      role: 'ADMIN',
      email: 'admin@email.com',
      password: 'admin123',
    });

    const response1 = await request(app.getHttpServer())
      .get(`/v1/users`)
      .query({ limit: 1, page: 0 })
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(200);

    expect(response1.body.results.length).toBe(1);
    expect(response1.body.total).toBe(2);
    expect(response1.body.resultsPerPage).toBe(1);
    expect(response1.body.nbPages).toBe(2);
    expect(response1.body.page).toBe(0);

    const response2 = await request(app.getHttpServer())
      .get(`/v1/users`)
      .query({ limit: 1, page: 1 })
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(200);

    expect(response2.body.results.length).toBe(1);
    expect(response2.body.total).toBe(2);
    expect(response2.body.resultsPerPage).toBe(1);
    expect(response2.body.nbPages).toBe(2);
    expect(response2.body.page).toBe(1);
  });

  it(`GET - v1/users should return correctly if no users are found`, async () => {
    const res = await signInForTest(authService, {
      role: 'ADMIN',
      email: 'admin@email.com',
      password: 'admin123',
    });

    const response1 = await request(app.getHttpServer())
      .get(`/v1/users`)
      .query({ limit: 10, page: 0 })
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(200);

    expect(response1.body.results.length).toBe(0);
    expect(response1.body.total).toBe(0);
    expect(response1.body.resultsPerPage).toBe(10);
    expect(response1.body.nbPages).toBe(0);
    expect(response1.body.page).toBe(0);
  });

  it(`GET - v1/users should throw error if requester is not authenticated`, async () => {
    await request(app.getHttpServer()).get(`/v1/users/someUser`).expect(401);
  });
});
