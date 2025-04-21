import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient {
  async onModuleInit() {
    console.time('prisma-connect');
    await this.$connect();
    console.timeEnd('prisma-connect');
  }
}
