import { IsNumber, IsString, Min, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @Min(1, { message: 'Amount must be at least 1 INR' })
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNumber()
  user_id: number;

  @IsString()
  seller_id: string;

  @IsString()
  variant_id: string;
}