import { Injectable } from '@nestjs/common';
import { UserRepository } from '../users/user.repository';
import { CreateUserDTO } from './dto/register-user.dto';
import { hash, compare } from 'bcrypt';
import { UserOutputDto } from './dto/user-output.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(dto: CreateUserDTO) {
    const passwordHash = await hash(dto.password, 10);

    const user = await this.usersRepository.createUser({
      ...dto,
      password: passwordHash,
    });

    return new UserOutputDto(user);
  }

  async loginUser(dto: LoginUserDTO) {
    const user = await this.usersRepository.findUser({
      email: dto.email,
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await compare(dto.password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token: token,
    };
  }
}
