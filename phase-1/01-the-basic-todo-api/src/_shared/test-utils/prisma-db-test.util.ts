import { PrismaService } from '../prisma-database/prisma.service';

export class PrismaTestUtils {
  constructor(private readonly prisma: PrismaService) {}

  async cleanDatabase() {
    const tablenames = await this.prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    try {
      await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);

      console.log('Database cleaned!');
    } catch (error) {
      console.error(error);
    }
  }
}
