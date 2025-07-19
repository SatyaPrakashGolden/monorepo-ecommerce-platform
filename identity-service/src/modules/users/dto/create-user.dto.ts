import {
  IsString,
  IsOptional,
  IsEmail,
  Length,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @IsEmail()
  @Length(1, 255)
  emailId: string;

  @IsString()
  @Length(1, 20)
  contactNo: string; 

  @IsString()
  @Length(1, 50)
  uniqueId: string; 

  @IsOptional()
  @IsString()
  @Length(1, 255)
  address?: string;

  @IsOptional()
  @IsBoolean()
  isContactVerified?: boolean; 

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;
}
