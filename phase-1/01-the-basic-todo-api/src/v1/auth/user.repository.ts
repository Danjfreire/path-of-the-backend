import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../_shared/prisma-database/prisma.service';
import { Prisma, User } from 'generated/prisma';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    try {
      const createdUser = await this.prismaService.user.create({ data });
      return createdUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // error P2002 is a unique constraint violation, in this case the email already exists
        if (error.code === 'P2002') {
          throw new Error('email-already-exists');
        }
      }
      throw error;
    }
  }

  async findUser(data: Prisma.UserWhereUniqueInput): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({ where: data });

    return user;
  }
}
