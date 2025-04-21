import { Injectable } from '@nestjs/common';
import { RegisterUserDTO } from './dto/register-user.dto';
import { UserRepository } from './user.repository';
import { hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async registerUser(dto: RegisterUserDTO) {
    const passwordHash = await hash(dto.password, 10);

    const user = await this.userRepository.registerUser({
      ...dto,
      password: passwordHash,
    });

    return user.id;
  }
}
