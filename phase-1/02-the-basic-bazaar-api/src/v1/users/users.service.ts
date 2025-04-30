import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserOutputDto } from '../auth/dto/user-output.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findUser(userId: string) {
    const user = await this.userRepository.findUser({ id: userId });

    if (!user) {
      return null;
    }

    return new UserOutputDto(user);
  }

  async findAllUsers(page: number, limit: number) {
    const res = await this.userRepository.findAllUsers(
      { role: 'USER' },
      { limit, offset: page * limit },
    );

    return res;
  }

  async updateUser(userId: string, data: UpdateUserDto) {
    const user = await this.userRepository.updateUser(userId, data);

    return user;
  }
}
