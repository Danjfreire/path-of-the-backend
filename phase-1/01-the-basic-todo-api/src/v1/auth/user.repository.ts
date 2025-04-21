import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../_shared/prisma-database/prisma.service';
import { Prisma, User } from 'generated/prisma';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async registerUser(data: Prisma.UserCreateInput): Promise<User> {
    const createdUser = await this.prismaService.user.create({ data });
    // TODO: Handle unique constraint errors

    return createdUser;
  }

  async findUser(data: Prisma.UserWhereUniqueInput): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({ where: data });

    return user;
  }
}
