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
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Product } from 'generated/prisma';

describe('ProductModule - findProduct', () => {
  let app: INestApplication;
  let prismaUtils: PrismaTestUtils;
  let authService: AuthService;
  let cacheManager: Cache;

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
    cacheManager = moduleRef.get<Cache>(CACHE_MANAGER);
  });

  afterEach(async () => {
    await prismaUtils.clearDatabase();
    await cacheManager.clear();
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

  it(`GET - v1/products/:id should get product from cache`, async () => {
    const res = await signInForTest(authService, {
      role: 'USER',
      email: 'john@email.com',
      password: '123456',
    });

    const mockedProduct: Product = {
      id: 'mocked-product-id',
      name: 'Mocked Product',
      description: 'Mocked Product Description',
      price: 100,
      category: 'BOOKS',
      sellerId: res.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isAvailable: true,
    };

    await cacheManager.set(
      `product:${mockedProduct.id}`,
      mockedProduct,
      1000 * 60,
    );

    const response = await request(app.getHttpServer())
      .get(`/v1/products/${mockedProduct.id}`)
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(200);

    expect(response.body).toEqual({
      ...mockedProduct,
      createdAt: mockedProduct.createdAt.toISOString(),
      updatedAt: mockedProduct.updatedAt.toISOString(),
    });
  });

  it('GET - v1/products/:id should fill cache', async () => {
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

    const cachePrevious = await cacheManager.get(
      `product:${createdProduct.body.id}`,
    );

    expect(cachePrevious).toBe(null);

    await request(app.getHttpServer())
      .get(`/v1/products/${createdProduct.body.id}`)
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(200);

    const cacheAfter = await cacheManager.get(
      `product:${createdProduct.body.id}`,
    );

    expect(cacheAfter).toBeDefined();
  });
});
