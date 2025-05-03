/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { ProductsService } from '../products.service';

describe('ProductModule - findAllProducts', () => {
  let app: INestApplication;
  let prismaUtils: PrismaTestUtils;
  let authService: AuthService;
  let productService: ProductsService;

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
    productService = moduleRef.get<ProductsService>(ProductsService);
  });

  afterEach(async () => {
    await prismaUtils.clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`GET - v1/products a user should be able to find products by category`, async () => {
    const res = await signInForTest(authService, {
      role: 'USER',
      email: 'john@email.com',
      password: '123456',
    });

    const mockProduct1: CreateProductDto = {
      name: 'Product 1',
      description: 'Product 1 description',
      price: 100,
      category: 'BOOKS',
    };
    const mockProduct2: CreateProductDto = {
      name: 'Product 2',
      description: 'Product 2 description',
      price: 50,
      category: 'CLOTHING',
    };

    const product1 = await productService.createProduct(
      res.user.id,
      mockProduct1,
    );
    const product2 = await productService.createProduct(
      res.user.id,
      mockProduct2,
    );

    const response1 = await request(app.getHttpServer())
      .get(`/v1/products`)
      .query({ category: 'BOOKS', page: 0, limit: 10 })
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(200);

    expect(response1.body.results.length).toBe(1);
    expect(response1.body.total).toBe(1);
    expect(response1.body.resultsPerPage).toBe(10);
    expect(response1.body.nbPages).toBe(1);
    expect(response1.body.page).toBe(0);
    expect(response1.body.results[0].id).toEqual(product1.id);

    const response2 = await request(app.getHttpServer())
      .get(`/v1/products`)
      .query({ category: 'CLOTHING', page: 0, limit: 10 })
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(200);

    expect(response2.body.results.length).toBe(1);
    expect(response2.body.total).toBe(1);
    expect(response2.body.resultsPerPage).toBe(10);
    expect(response2.body.nbPages).toBe(1);
    expect(response2.body.page).toBe(0);
    expect(response2.body.results[0].id).toEqual(product2.id);
  });

  it(`GET - v1/products a user should be able to find products`, async () => {
    const res = await signInForTest(authService, {
      role: 'USER',
      email: 'john@email.com',
      password: '123456',
    });

    const mockProduct1: CreateProductDto = {
      name: 'Product 1',
      description: 'Product 1 description',
      price: 100,
      category: 'BOOKS',
    };
    const mockProduct2: CreateProductDto = {
      name: 'Product 2',
      description: 'Product 2 description',
      price: 50,
      category: 'CLOTHING',
    };

    const product1 = await productService.createProduct(
      res.user.id,
      mockProduct1,
    );
    const product2 = await productService.createProduct(
      res.user.id,
      mockProduct2,
    );

    const response1 = await request(app.getHttpServer())
      .get(`/v1/products`)
      .query({ page: 0, limit: 10 })
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(200);

    const hasProduct1 = response1.body.results.some(
      (product) => product.id === product1.id,
    );
    const hasProduct2 = response1.body.results.some(
      (product) => product.id === product1.id,
    );

    expect(response1.body.results.length).toBe(2);
    expect(response1.body.total).toBe(2);
    expect(response1.body.resultsPerPage).toBe(10);
    expect(response1.body.nbPages).toBe(1);
    expect(response1.body.page).toBe(0);
    expect(hasProduct1).toBe(true);
    expect(hasProduct2).toBe(true);

    const response2 = await request(app.getHttpServer())
      .get(`/v1/products`)
      .query({ category: 'CLOTHING', page: 0, limit: 10 })
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(200);

    expect(response2.body.results.length).toBe(1);
    expect(response2.body.total).toBe(1);
    expect(response2.body.resultsPerPage).toBe(10);
    expect(response2.body.nbPages).toBe(1);
    expect(response2.body.page).toBe(0);
    expect(response2.body.results[0].id).toEqual(product2.id);
  });

  it(`GET - v1/products should return correctly if no products are found`, async () => {
    const res = await signInForTest(authService, {
      role: 'ADMIN',
      email: 'admin@email.com',
      password: 'admin123',
    });

    const response1 = await request(app.getHttpServer())
      .get(`/v1/products`)
      .query({ limit: 10, page: 0 })
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(200);

    expect(response1.body.results.length).toBe(0);
    expect(response1.body.total).toBe(0);
    expect(response1.body.resultsPerPage).toBe(10);
    expect(response1.body.nbPages).toBe(0);
    expect(response1.body.page).toBe(0);
  });

  it(`GET - v1/products should throw error if requester is not authenticated`, async () => {
    await request(app.getHttpServer()).get(`/v1/products`).expect(401);
  });
});
