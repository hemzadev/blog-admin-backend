import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsNotEmpty()
  name: string;
}