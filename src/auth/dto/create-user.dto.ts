import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator'

export class CreateUserDto {
  @IsEmail()
  email: string

  @MinLength(8)
  password: string

  @IsNotEmpty()
  @IsString()
  name: string
}
