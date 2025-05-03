/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';
import { PrismaTestUtils } from 'src/_shared/test-utils/prisma-db-test.util';
import { PrismaService } from 'src/_shared/prisma-database/prisma.service';
import { isDateString, isUUID } from 'class-validator';
import { signInForTest } from 'src/_shared/test-utils/signin-for-test.util';
import { AuthService } from 'src/v1/auth/auth.service';
import { AuthModule } from 'src/v1/auth/auth.module';
import { OrdersModule } from '../orders.module';
import { ProductsModule } from 'src/v1/products/products.module';
import { CreateProductDto } from 'src/v1/products/dto/create-product.dto';

describe('OrdersModule- createOrder', () => {
  let app: INestApplication;
  let prismaUtils: PrismaTestUtils;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaDatabaseModule, AuthModule, OrdersModule, ProductsModule],
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

  it(`POST - v1/order a user should create an order with correct fields`, async () => {
    // creates products
    const product1: CreateProductDto = {
      category: 'BOOKS',
      description: 'A great book',
      name: 'The Great Book',
      price: 20,
    };
    const product2: CreateProductDto = {
      category: 'BOOKS',
      description: 'Another great book',
      name: 'The Greatest Book',
      price: 30,
    };

    const seller = await signInForTest(authService, {
      role: 'USER',
      email: 'john@email.com',
      password: 'safepassword',
      name: 'John Doe',
    });

    const product1Res = await request(app.getHttpServer())
      .post('/v1/products')
      .send(product1)
      .set('Authorization', `Bearer ${seller.access_token}`)
      .expect(201);

    const product2Res = await request(app.getHttpServer())
      .post('/v1/products')
      .send(product2)
      .set('Authorization', `Bearer ${seller.access_token}`)
      .expect(201);

    // creates order
    const buyer = await signInForTest(authService, {
      role: 'USER',
      email: 'anne@email.com',
      password: 'safepassword',
      name: 'Anne Doe',
    });

    const orderResponse = await request(app.getHttpServer())
      .post('/v1/orders')
      .set('Authorization', `Bearer ${buyer.access_token}`)
      .set('Idempotency-Key', '123e4567-e89b-12d3-a456-426614174000')
      .send({
        itemIds: [product1Res.body.id, product2Res.body.id],
      })
      .expect(201);

    expect(isUUID(orderResponse.body.id)).toBe(true);
    expect(orderResponse.body.orderItems.length).toEqual(2);
    expect(orderResponse.body.totalPrice).toEqual(
      product1.price + product2.price,
    );
    expect(orderResponse.body.userId).toEqual(buyer.user.id);
    expect(isDateString(orderResponse.body.createdAt)).toBe(true);
    expect(orderResponse.body.status).toEqual('PENDING');
  });

  it(`POST - v1/order a user should make items unavailable after order creation`, async () => {
    // creates products
    const product1: CreateProductDto = {
      category: 'BOOKS',
      description: 'A great book',
      name: 'The Great Book',
      price: 20,
    };
    const product2: CreateProductDto = {
      category: 'BOOKS',
      description: 'Another great book',
      name: 'The Greatest Book',
      price: 30,
    };

    const seller = await signInForTest(authService, {
      role: 'USER',
      email: 'john@email.com',
      password: 'safepassword',
      name: 'John Doe',
    });

    const product1Res = await request(app.getHttpServer())
      .post('/v1/products')
      .send(product1)
      .set('Authorization', `Bearer ${seller.access_token}`)
      .expect(201);

    const product2Res = await request(app.getHttpServer())
      .post('/v1/products')
      .send(product2)
      .set('Authorization', `Bearer ${seller.access_token}`)
      .expect(201);

    // creates order
    const buyer = await signInForTest(authService, {
      role: 'USER',
      email: 'anne@email.com',
      password: 'safepassword',
      name: 'Anne Doe',
    });

    await request(app.getHttpServer())
      .post('/v1/orders')
      .set('Authorization', `Bearer ${buyer.access_token}`)
      .set('Idempotency-Key', '123e4567-e89b-12d3-a456-426614174000')
      .send({
        itemIds: [product1Res.body.id, product2Res.body.id],
      })
      .expect(201);

    const product1after = await request(app.getHttpServer())
      .get(`/v1/products/${product1Res.body.id}`)
      .set('Authorization', `Bearer ${buyer.access_token}`)
      .expect(200);

    const product2after = await request(app.getHttpServer())
      .get(`/v1/products/${product2Res.body.id}`)
      .set('Authorization', `Bearer ${buyer.access_token}`)
      .expect(200);

    expect(product1after.body.isAvailable).toBe(false);
    expect(product2after.body.isAvailable).toBe(false);
  });

  it(`POST - v1/order an admin should not be able to create an order`, async () => {
    const admin = await signInForTest(authService, {
      role: 'ADMIN',
      email: 'john@email.com',
      password: 'safepassword',
      name: 'John Doe',
    });

    await request(app.getHttpServer())
      .post('/v1/orders')
      .set('Authorization', `Bearer ${admin.access_token}`)
      .set('Idempotency-Key', '123e4567-e89b-12d3-a456-426614174000')
      .send({
        itemIds: ['itemId'],
      })
      .expect(403);
  });

  it(`POST - v1/order should return error if user tries to buy unavailable item`, async () => {
    // creates products
    const product1: CreateProductDto = {
      category: 'BOOKS',
      description: 'A great book',
      name: 'The Great Book',
      price: 20,
    };

    const seller = await signInForTest(authService, {
      role: 'USER',
      email: 'john@email.com',
      password: 'safepassword',
      name: 'John Doe',
    });

    const product1Res = await request(app.getHttpServer())
      .post('/v1/products')
      .send(product1)
      .set('Authorization', `Bearer ${seller.access_token}`)
      .expect(201);

    // deletes product, making it unavailable
    await request(app.getHttpServer())
      .delete(`/v1/products/${product1Res.body.id}`)
      .set('Authorization', `Bearer ${seller.access_token}`)
      .expect(200);

    // creates order
    const buyer = await signInForTest(authService, {
      role: 'USER',
      email: 'anne@email.com',
      password: 'safepassword',
      name: 'Anne Doe',
    });

    await request(app.getHttpServer())
      .post('/v1/orders')
      .set('Authorization', `Bearer ${buyer.access_token}`)
      .set('Idempotency-Key', '123e4567-e89b-12d3-a456-426614174000')
      .send({
        itemIds: [product1Res.body.id],
      })
      .expect(422);
  });

  it(`POST - v1/order should return error if user tries to buy an item that doesnt exist`, async () => {
    // creates order
    const buyer = await signInForTest(authService, {
      role: 'USER',
      email: 'anne@email.com',
      password: 'safepassword',
      name: 'Anne Doe',
    });

    await request(app.getHttpServer())
      .post('/v1/orders')
      .set('Authorization', `Bearer ${buyer.access_token}`)
      .set('Idempotency-Key', '123e4567-e89b-12d3-a456-426614174000')
      .send({
        itemIds: ['some-random-id'],
      })
      .expect(422);
  });

  it(`POST - v1/order should throw error if user provides invalid Idempotency-Key`, async () => {
    // creates order
    const buyer = await signInForTest(authService, {
      role: 'USER',
      email: 'anne@email.com',
      password: 'safepassword',
      name: 'Anne Doe',
    });

    // no Key
    const res1 = await request(app.getHttpServer())
      .post('/v1/orders')
      .set('Authorization', `Bearer ${buyer.access_token}`)
      .send({
        itemIds: ['some-random-id'],
      })
      .expect(400);

    expect(res1.body.message).toEqual(
      'invalid-or-missing-idempotency-key-header',
    );

    // not an UUID
    const res2 = await request(app.getHttpServer())
      .post('/v1/orders')
      .set('Authorization', `Bearer ${buyer.access_token}`)
      .set('Idempotency-Key', 'some-key')
      .send({
        itemIds: ['some-random-id'],
      })
      .expect(400);

    expect(res2.body.message).toEqual(
      'invalid-or-missing-idempotency-key-header',
    );
  });
});
