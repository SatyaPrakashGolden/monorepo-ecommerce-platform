import { IsEmail, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

export class RegisterUserDto {
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @IsEmail()
  @IsNotEmpty()
  emailId: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(255)
  password: string;
}
