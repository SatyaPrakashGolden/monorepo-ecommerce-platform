// order/dto/create-order.dto.ts
import { IsNumber, IsString, IsOptional } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderDto {
  @IsNumber()
  user_id: number;

  @IsString()
  product_id: string;

  @IsNumber()
  total_amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @IsOptional()
  status?: OrderStatus;

  @IsString()
  @IsOptional()
  razorpay_order_id?: string;

  @IsString()
  @IsOptional()
  receipt?: string;

  @IsNumber()
  @IsOptional()
  razorpay_created_at?: number;
}