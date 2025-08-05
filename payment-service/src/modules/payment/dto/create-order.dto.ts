import { IsNumber, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  currency: string = 'INR';

  @IsString()
  paymentMethod: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  contact?: string;
}