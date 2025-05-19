/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';
import { PrismaTestUtils } from 'src/_shared/test-utils/prisma-db-test.util';
import { PrismaService } from 'src/_shared/prisma-database/prisma.service';
import { NotificationModule } from '../notification.module';
import { NotificationHandlerController } from '../notification-handler.controller';
import { NotificationService } from '../notification.service';
import { RmqContext } from '@nestjs/microservices';
import * as request from 'supertest';
import { isUUID } from 'class-validator';

describe('OrdersModule - CreateOrder', () => {
  let app: INestApplication;
  let prismaUtils: PrismaTestUtils;
  let service: NotificationService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaDatabaseModule, NotificationModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prismaUtils = new PrismaTestUtils(
      moduleRef.get<PrismaService>(PrismaService),
    );

    service = moduleRef.get<NotificationService>(NotificationService);
  });

  afterEach(async () => {
    await prismaUtils.clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`GET - v1/notifications should list emited notifications`, async () => {
    // Valid payload
    const validPayload = {
      userId: 'b3b8c7e2-1c2d-4e7a-9b2a-2e8e2e8e2e8e',
      userContact: { email: 'test@example.com' },
      orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6',
    };

    await service.createEmailNotification(validPayload);

    const response1 = await request(app.getHttpServer())
      .get(`/v1/notifications`)
      .query({ page: 0, limit: 10 })
      .expect(200);

    const notification = response1.body[0];

    expect(isUUID(notification.id)).toBe(true);
    expect(notification.userId).toBe(validPayload.userId);
    expect(notification.userEmail).toBe(validPayload.userContact.email);
    expect(notification.orderId).toBe(validPayload.orderId);
    expect(notification.type).toBe('email');
  });
});
