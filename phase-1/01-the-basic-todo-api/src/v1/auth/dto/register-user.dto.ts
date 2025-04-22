/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  public readonly name: string;

  @IsEmail()
  public readonly email: string;

  @IsString()
  @Length(6, 64)
  public readonly password: string;
}
