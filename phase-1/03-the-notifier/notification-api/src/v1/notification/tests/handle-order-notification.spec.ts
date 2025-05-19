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

describe('OrdersModule - CreateOrder', () => {
  let app: INestApplication;
  let prismaUtils: PrismaTestUtils;
  let controller: NotificationHandlerController;
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

    controller = moduleRef.get<NotificationHandlerController>(
      NotificationHandlerController,
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

  it(`order.notification - should handle order notification event with valid payload`, async () => {
    const ack = jest.fn();
    const nack = jest.fn();
    const channel = { ack, nack };
    const originalMessage = { content: Buffer.from('test') };
    const context = {
      getMessage: () => originalMessage,
      getChannelRef: () => channel,
    } as unknown as RmqContext;

    // Valid payload
    const validPayload = {
      userId: 'b3b8c7e2-1c2d-4e7a-9b2a-2e8e2e8e2e8e',
      userContact: { email: 'test@example.com' },
      orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6',
    };

    jest.spyOn(service, 'createEmailNotification');

    await controller.handleOrderNotification(validPayload, context);
    expect(service.createEmailNotification).toHaveBeenCalledWith({
      userId: validPayload.userId,
      userContact: validPayload.userContact,
      orderId: validPayload.orderId,
    });
    expect(ack).toHaveBeenCalledWith(originalMessage);
    expect(nack).not.toHaveBeenCalled();
  });

  it(`order.notification - should handle order notification event with invalid payload`, async () => {
    const ack = jest.fn();
    const nack = jest.fn();
    const channel = { ack, nack };
    const originalMessage = { content: Buffer.from('test') };
    const context = {
      getMessage: () => originalMessage,
      getChannelRef: () => channel,
    } as unknown as RmqContext;

    jest.spyOn(service, 'createEmailNotification');

    // Invalid payload
    const invalidPayload = {
      userId: 'not-a-uuid',
      userContact: { email: 'not-an-email' },
      orderId: 'not-a-uuid',
    };

    await controller.handleOrderNotification(invalidPayload, context);
    expect(service.createEmailNotification).not.toHaveBeenCalled();
    expect(nack).toHaveBeenCalledWith(originalMessage, false, true);
    expect(ack).not.toHaveBeenCalled();
  });
});
