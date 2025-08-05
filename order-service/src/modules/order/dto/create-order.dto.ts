import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  userId: number;

  @IsString()
  sellerId: string;

  @IsString()
  variantId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  currency: string = 'INR';
}