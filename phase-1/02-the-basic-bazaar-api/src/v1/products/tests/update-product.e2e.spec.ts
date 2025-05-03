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

describe('ProductModule - updateProduct', () => {
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

  it(`PATCH - v1/products/:id a user should be able to update their own products`, async () => {
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

    const updateProductDto = {
      name: 'Updated product name',
      description: 'Updated product description',
      price: 200,
    };

    const response = await request(app.getHttpServer())
      .patch(`/v1/products/${createdProduct.body.id}`)
      .set('Authorization', `Bearer ${res.access_token}`)
      .send(updateProductDto)
      .expect(200);

    expect(response.body.name).toEqual(updateProductDto.name);
    expect(response.body.description).toEqual(updateProductDto.description);
    expect(response.body.price).toEqual(updateProductDto.price);
    expect(response.body.category).toEqual(mockCreateProductDto.category);
    expect(response.body.sellerId).toEqual(res.user.id);
    expect(response.body.id).toEqual(createdProduct.body.id);
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();
    expect(response.body.isAvailable).toEqual(true);
  });

  it(`PATCH - v1/products/:id an admin should be able to update any product`, async () => {
    const admin = await signInForTest(authService, {
      role: 'ADMIN',
      email: 'johnadmin@email.com',
      password: '123456',
    });

    const user = await signInForTest(authService, {
      role: 'USER',
      email: 'johnuser@email.com',
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
      .set('Authorization', `Bearer ${user.access_token}`)
      .send(mockCreateProductDto)
      .expect(201);

    const updateProductDto = {
      name: 'Updated product name',
      description: 'Updated product description',
      price: 200,
    };

    const response = await request(app.getHttpServer())
      .patch(`/v1/products/${createdProduct.body.id}`)
      .set('Authorization', `Bearer ${admin.access_token}`)
      .send(updateProductDto)
      .expect(200);

    expect(response.body.name).toEqual(updateProductDto.name);
    expect(response.body.description).toEqual(updateProductDto.description);
    expect(response.body.price).toEqual(updateProductDto.price);
    expect(response.body.category).toEqual(mockCreateProductDto.category);
    expect(response.body.sellerId).toEqual(user.user.id);
    expect(response.body.id).toEqual(createdProduct.body.id);
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();
    expect(response.body.isAvailable).toEqual(true);
  });

  it(`PATCH - v1/products/:id should throw error if product cannot be found`, async () => {
    const res = await signInForTest(authService, {
      role: 'ADMIN',
      email: 'admin@email.com',
      password: 'admin123',
    });

    await request(app.getHttpServer())
      .patch(`/v1/products/someproductid`)
      .set('Authorization', `Bearer ${res.access_token}`)
      .expect(404);
  });

  it(`PATCH - v1/products/:id should throw error if requester is not authenticated`, async () => {
    await request(app.getHttpServer())
      .patch(`/v1/products/someproductid`)
      .expect(401);
  });

  it(`PATCH - v1/products/:id should throw forbidden error if requester is not the owner of the product`, async () => {
    const user1 = await signInForTest(authService, {
      role: 'USER',
      email: 'johnauser1@email.com',
      password: '123456',
    });

    const user2 = await signInForTest(authService, {
      role: 'USER',
      email: 'johnuser2@email.com',
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
      .set('Authorization', `Bearer ${user1.access_token}`)
      .send(mockCreateProductDto)
      .expect(201);

    const updateProductDto = {
      name: 'Updated product name',
      description: 'Updated product description',
      price: 200,
    };

    await request(app.getHttpServer())
      .patch(`/v1/products/${createdProduct.body.id}`)
      .set('Authorization', `Bearer ${user2.access_token}`)
      .send(updateProductDto)
      .expect(403);
  });
});
