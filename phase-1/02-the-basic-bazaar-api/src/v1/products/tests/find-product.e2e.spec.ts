/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaTestUtils } from 'src/_shared/test-utils/prisma-db-test.util';
import { PrismaService } from 'src/_shared/prisma-database/prisma.service';
import { signInForTest } from 'src/_shared/test-utils/signin-for-test.util';
import { AuthService } from 'src/v1/auth/auth.service';
import { AuthModule } from 'src/v1/auth/auth.module';
import { ProductsModule } from '../products.module';
import { CreateProductDto } from '../dto/create-product.dto';

describe('ProductModule - findProduct', () => {
  let app: INestApplication;
  let prismaUtils: PrismaTestUtils;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ProductsModule, AuthModule],
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

  it(`GET - v1/products/:id a user should be able to find a product`, async () => {
    const res = await signInForTest(authService, {
      role: 'USER',
      email: 'john@email.com',
      password: '123456',
    });

    const mockCreateProductDto: CreateProductDto = {
      name: 'Product 1',
      description: 'Product 1 description',
      price: 100,
      category: 'BOOKS',
    };

    const createdProduct = await request(app.getHttpServer())
      .post(`/v1/products`)
      .set('Authorization', `Bearer ${res.access_token}`)
      .send(mockCreateProductDto)
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/v1/products/${createdProduct.body.id}`)
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(200);

    expect(response.body).toEqual(createdProduct.body);
  });

  it(`GET - v1/products/:id an admin should be able to find a product`, async () => {
    const res = await signInForTest(authService, {
      role: 'ADMIN',
      email: 'john@email.com',
      password: '123456',
    });

    const mockCreateProductDto: CreateProductDto = {
      name: 'Product 1',
      description: 'Product 1 description',
      price: 100,
      category: 'BOOKS',
    };

    const createdProduct = await request(app.getHttpServer())
      .post(`/v1/products`)
      .set('Authorization', `Bearer ${res.access_token}`)
      .send(mockCreateProductDto)
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/v1/products/${createdProduct.body.id}`)
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(200);

    expect(response.body).toEqual(createdProduct.body);
  });

  it(`GET - v1/products/:id should throw error if product cannot be found`, async () => {
    const res = await signInForTest(authService, {
      role: 'ADMIN',
      email: 'admin@email.com',
      password: 'admin123',
    });

    await request(app.getHttpServer())
      .get(`/v1/products/someproductid`)
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(404);
  });

  it(`GET - v1/products/:id should throw error if requester is not authenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/v1/products/someproductid`)
      .expect(401);
  });
});
