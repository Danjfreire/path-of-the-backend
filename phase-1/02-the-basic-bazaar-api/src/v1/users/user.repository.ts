import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { PrismaService } from 'src/_shared/prisma-database/prisma.service';
import { UserInfo } from './models/user.model';
import { UpdateUserDto } from './dto/update-user.dto';

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
    const user = await this.prismaService.user.findUnique({
      where: data,
    });

    return user;
  }

  async findAllUsers(
    data: Prisma.UserWhereInput,
    options: { limit: number; offset: number },
  ): Promise<{
    results: UserInfo[];
    page: number;
    nbPages: number;
    resultsPerPage: number;
    total: number;
  }> {
    const [total, users] = await Promise.all([
      this.prismaService.user.count({ where: data }),
      this.prismaService.user.findMany({
        where: data,
        take: options.limit,
        skip: options.offset,
        omit: { password: true },
      }),
    ]);

    const res = {
      results: users,
      page: Math.floor(options.offset / options.limit),
      nbPages: Math.ceil(total / options.limit),
      resultsPerPage: options.limit,
      total,
    };

    return res;
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<UserInfo | null> {
    try {
      const user = await this.prismaService.user.update({
        where: { id },
        data,
      });

      const userInfo: UserInfo = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      return userInfo;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // error P2025 happens when the record to update is not found
        if (error.code === 'P2025') {
          return null;
        }
      }

      console.error(error);
      return null;
    }
  }
}
