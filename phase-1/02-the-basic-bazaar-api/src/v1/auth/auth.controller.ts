import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/register-user.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async createUser(@Body() dto: CreateUserDTO) {
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
}
