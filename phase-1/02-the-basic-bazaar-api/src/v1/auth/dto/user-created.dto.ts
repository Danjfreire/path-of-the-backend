import { Exclude } from 'class-transformer';

export class UserCreatedDTO {
  id: string;
  name: string;
  email: string;
  role: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserCreatedDTO>) {
    Object.assign(this, partial);
  }
}
