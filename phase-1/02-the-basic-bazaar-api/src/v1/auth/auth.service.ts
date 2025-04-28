import { Injectable } from '@nestjs/common';
import { UserRepository } from '../users/user.repository';
import { CreateUserDTO } from './dto/register-user.dto';
import { hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UserRepository) {}

  async createUser(dto: CreateUserDTO) {
    const passwordHash = await hash(dto.password, 10);

    const user = await this.usersRepository.createUser({
      ...dto,
      password: passwordHash,
    });

    return user.id;
  }
}
