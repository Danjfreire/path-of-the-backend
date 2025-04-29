import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserOutputDto } from '../auth/dto/user-output.dto';

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
}
