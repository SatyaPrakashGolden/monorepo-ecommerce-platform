
import { IsNumber, IsString, IsOptional, IsEnum, IsPositive, MaxLength } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  user_id: number;

  @IsString()
  @IsOptional()
  @MaxLength(255) // Increased to match entity
  product_id?: string;

  @IsNumber()
  @IsPositive()
  total_amount: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string = 'INR';

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus = OrderStatus.PENDING;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  razorpay_order_id?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  receipt?: string;

  @IsNumber()
  @IsOptional()
  razorpay_created_at?: number;
}