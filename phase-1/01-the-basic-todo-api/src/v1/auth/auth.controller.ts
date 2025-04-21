import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async createUser(@Body() dto: RegisterUserDTO): Promise<{ id: string }> {
    const id = await this.authService.createUser(dto);

    return { id };
  }

  @Post('/login')
  async loginUser(
    @Body() dto: LoginUserDTO,
  ): Promise<{ access_token: string }> {
    return await this.authService.signIn(dto);
  }
}
