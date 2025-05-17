import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from 'src/v1/auth/dto/register-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDTO) {}
