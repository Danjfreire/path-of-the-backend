import { Exclude } from 'class-transformer';

export class UserOutputDto {
  id: string;
  name: string;
  email: string;
  role: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserOutputDto>) {
    Object.assign(this, partial);
  }
}
