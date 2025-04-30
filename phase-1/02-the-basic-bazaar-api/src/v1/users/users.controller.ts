import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../../_shared/authorization/guards/auth.guard';
import { UsersService } from './users.service';
import { TokenPayload } from '../auth/models/token-payload';
import { Roles } from 'src/_shared/authorization/decorators/roles.decorator';
import { ReqUser } from 'src/_shared/authorization/decorators/user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(AuthGuard)
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Roles('ADMIN')
  @Get()
  async findAllUsers(
    @Query('page', ParseIntPipe) page: number = 0,
    @Query('limit', ParseIntPipe) limit: number = 10, // number of users per page
  ) {
    const res = await this.usersService.findAllUsers(page, limit);

    return res;
  }

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
  async updateUser(
    @Param('id') userId: string,
    @Body() dto: UpdateUserDto,
    @ReqUser() requestUser: TokenPayload,
  ) {
    // Only admins or the user themselves can access their own data
    if (requestUser.role !== 'ADMIN' && requestUser.sub !== userId) {
      throw new ForbiddenException();
    }

    const user = await this.usersService.updateUser(userId, dto);

    if (!user) {
      throw new NotFoundException('user-not-found');
    }

    return user;
  }
}
