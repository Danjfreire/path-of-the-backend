import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/register')
  async createUser(@Body() dto: CreateUserDTO) {
    try {
      return await this.authService.createUser(dto);
    } catch (error) {
      if (error instanceof Error) {
        throw new ConflictException(error.message);
      } else {
        console.error(error);
        throw new InternalServerErrorException();
      }
    }
  }

  @Post('/login')
  async loginUser(@Body() dto: LoginUserDTO) {
    const res = await this.authService.loginUser(dto);

    if (!res) {
      throw new UnauthorizedException('invalid-credentials');
    }

    return res;
  }
}
