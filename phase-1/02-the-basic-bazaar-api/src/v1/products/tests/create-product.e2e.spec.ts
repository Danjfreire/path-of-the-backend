/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';
import { PrismaTestUtils } from 'src/_shared/test-utils/prisma-db-test.util';
import { PrismaService } from 'src/_shared/prisma-database/prisma.service';
import { isDateString, isUUID } from 'class-validator';
import { ProductsModule } from '../products.module';
import { CreateProductDto } from '../dto/create-product.dto';
import { signInForTest } from 'src/_shared/test-utils/signin-for-test.util';
import { AuthService } from 'src/v1/auth/auth.service';
import { AuthModule } from 'src/v1/auth/auth.module';

describe('ProductModule - createProduct', () => {
  let app: INestApplication;
  let prismaUtils: PrismaTestUtils;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaDatabaseModule, AuthModule, ProductsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
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

  it(`POST - v1/products should create a product`, async () => {
    const mockCreateProductDto: CreateProductDto = {
      category: 'BOOKS',
      description: 'A great book',
      name: 'The Great Book',
      price: 19.99,
    };

    const res = await signInForTest(authService, {
      role: 'USER',
      email: 'john@email.com',
      password: 'safepassword',
      name: 'John Doe',
    });

    const response = await request(app.getHttpServer())
      .post('/v1/products')
      .send(mockCreateProductDto)
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(201);

    expect(isUUID(response.body.id)).toBe(true);
    expect(response.body.name).toEqual(mockCreateProductDto.name);
    expect(response.body.description).toEqual(mockCreateProductDto.description);
    expect(response.body.sellerId).toEqual(res.user.id);
    expect(response.body.price).toEqual(mockCreateProductDto.price);
    expect(response.body.category).toEqual(mockCreateProductDto.category);
    expect(isDateString(response.body.createdAt)).toBe(true);
    expect(isDateString(response.body.updatedAt)).toBe(true);
  });

  it(`POST - v1/producs should throw bad request if fields are invalid`, async () => {
    const loginRes = await signInForTest(authService, {
      email: 'email@email.com',
      password: 'password',
      role: 'USER',
    });

    const res = await request(app.getHttpServer())
      .post('/v1/products')
      .set('Authorization', `Bearer ${loginRes.access_token}`)
      .send({})
      .expect(400);

    const errors = res.body.message as string[];

    expect(errors.includes('name must be a string')).toBe(true);
    expect(errors.includes('description must be a string')).toBe(true);
    expect(errors.includes('price must not be less than 1')).toBe(true);
    expect(
      errors.includes(
        'price must be a number conforming to the specified constraints',
      ),
    ).toBe(true);
    expect(errors.includes('category must be a string')).toBe(true);
  });

  it(`POST - v1/products should throw error if trying to create a product without authentication`, async () => {
    const mockCreateProductDto: CreateProductDto = {
      category: 'BOOKS',
      description: 'A great book',
      name: 'The Great Book',
      price: 19.99,
    };

    await request(app.getHttpServer())
      .post('/v1/products')
      .send(mockCreateProductDto)
      .expect(401);
  });
});
