/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../auth.module';
import * as request from 'supertest';
import { CreateUserDTO } from '../dto/register-user.dto';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';
import { ConfigModule } from '@nestjs/config';

describe('AuthModule - CreateUser', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaDatabaseModule, ConfigModule, AuthModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    // TODO: clean up the db
  });

  afterAll(async () => {
    await app.close();
  });

  it(`POST - v1/auth/register should create a user`, async () => {
    console.log('secret:', process.env.JWT_SECRET);
    const mockCreateUserDto: CreateUserDTO = {
      name: 'John Doe',
      email: 'john@email.com',
      password: 'safepassword',
    };

    const response = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send(mockCreateUserDto)
      .expect(201);

    expect(response.body.id).toBeDefined();
  });
});
