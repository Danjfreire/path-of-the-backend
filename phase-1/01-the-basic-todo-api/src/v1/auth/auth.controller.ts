import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async createUser(@Body() dto: CreateUserDTO): Promise<{ id: string }> {
    try {
      const id = await this.authService.createUser(dto);
      return { id };
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
  async loginUser(
    @Body() dto: LoginUserDTO,
  ): Promise<{ access_token: string }> {
    const res = await this.authService.login(dto);

    if (!res) {
      throw new UnauthorizedException('invalid-credentials');
    }

    return res;
  }
}
