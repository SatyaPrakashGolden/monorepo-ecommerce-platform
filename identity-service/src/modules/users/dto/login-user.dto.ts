// src/modules/user/dto/login-user.dto.ts

import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  emailId: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
