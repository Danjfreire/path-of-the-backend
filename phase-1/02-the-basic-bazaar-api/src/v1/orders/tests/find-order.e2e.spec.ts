/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';
import { PrismaTestUtils } from 'src/_shared/test-utils/prisma-db-test.util';
import { PrismaService } from 'src/_shared/prisma-database/prisma.service';
import { signInForTest } from 'src/_shared/test-utils/signin-for-test.util';
import { AuthService } from 'src/v1/auth/auth.service';
import { AuthModule } from 'src/v1/auth/auth.module';
import { OrdersModule } from '../orders.module';
import { ProductsModule } from 'src/v1/products/products.module';
import { CreateProductDto } from 'src/v1/products/dto/create-product.dto';

describe('OrdersModule- findOrder', () => {
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

  it(`GET - v1/orders/:id a user should find an order`, async () => {
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

    const findResponse = await request(app.getHttpServer())
      .get(`/v1/orders/${orderResponse.body.id}`)
      .set('Authorization', `Bearer ${buyer.access_token}`)
      .expect(200);

    expect(findResponse.body).toEqual(orderResponse.body);
  });

  it(`GET - v1/orders/:id should throw error if order is not found`, async () => {
    // creates order
    const buyer = await signInForTest(authService, {
      role: 'USER',
      email: 'anne@email.com',
      password: 'safepassword',
      name: 'Anne Doe',
    });

    await request(app.getHttpServer())
      .get(`/v1/orders/some-order-id`)
      .set('Authorization', `Bearer ${buyer.access_token}`)
      .expect(404);
  });

  it(`GET - v1/orders/:id an admin should not be able to find an order`, async () => {
    const admin = await signInForTest(authService, {
      role: 'ADMIN',
      email: 'john@email.com',
      password: 'safepassword',
      name: 'John Doe',
    });

    await request(app.getHttpServer())
      .get('/v1/orders/some-order-id')
      .set('Authorization', `Bearer ${admin.access_token}`)
      .expect(403);
  });
});
