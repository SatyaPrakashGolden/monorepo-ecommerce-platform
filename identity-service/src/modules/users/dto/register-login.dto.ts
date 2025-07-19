// src/user/dto/register-login.dto.ts
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class RegisterLoginDto {
  @IsEmail()
  @IsNotEmpty()
  emailId: string;

  @IsString()
  @IsNotEmpty()
  uniqueId: string;
}


