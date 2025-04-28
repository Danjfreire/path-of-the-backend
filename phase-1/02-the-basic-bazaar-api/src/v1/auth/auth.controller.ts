import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/register-user.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/signup')
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
}
