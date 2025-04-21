import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from './dto/register-user.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async registerUser(@Body() dto: RegisterUserDTO) {
    return await this.authService.registerUser(dto);
  }

  @Post('/login')
  async loginUser() {}
}
