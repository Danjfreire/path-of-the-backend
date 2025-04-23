import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from './dto/register-user.dto';
import { UserRepository } from './user.repository';
import { compare, hash } from 'bcrypt';
import { LoginUserDTO } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(dto: CreateUserDTO) {
    const passwordHash = await hash(dto.password, 10);

    const user = await this.userRepository.createUser({
      ...dto,
      password: passwordHash,
    });

    return user.id;
  }

  async signIn(dto: LoginUserDTO): Promise<{ access_token: string } | null> {
    const user = await this.userRepository.findUser({
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
    });

    return {
      access_token: token,
    };
  }
}
