import {
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../../_shared/authorization/guards/auth.guard';
import { UsersService } from './users.service';
import { TokenPayload } from '../auth/models/token-payload';
import { Roles } from 'src/_shared/authorization/decorators/roles.decorator';
import { ReqUser } from 'src/_shared/authorization/decorators/user.decorator';

@UseGuards(AuthGuard)
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('ADMIN')
  @Get()
  async findAllUsers() {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Roles('ADMIN', 'USER')
  @Get(':id')
  async findUser(
    @Param('id') userId: string,
    @ReqUser() requestUser: TokenPayload,
  ) {
    // Only admins or the user themselves can access their own data
    if (requestUser.role !== 'ADMIN' && requestUser.sub !== userId) {
      throw new ForbiddenException();
    }

    const user = await this.usersService.findUser(userId);

    if (!user) {
      throw new NotFoundException('user-not-found');
    }

    return user;
  }

  @Roles('ADMIN', 'USER')
  @Patch(':id')
  async updateUser() {}
}
