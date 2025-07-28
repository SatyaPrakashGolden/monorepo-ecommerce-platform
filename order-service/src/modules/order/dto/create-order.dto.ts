import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsIn,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity'; 

export class CreateOrderDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  seller_id: string;

  @IsString()
  @IsNotEmpty()
  variant_id: string;

  @IsString()
  @IsNotEmpty()
  total_amount: string;

  @IsString()
  @IsOptional()
  @IsIn(['INR', 'USD', 'EUR'])
  currency?: string = 'INR';

  @IsOptional()
  @IsIn(Object.values(OrderStatus))
  status?: OrderStatus = OrderStatus.PENDING;

  @IsString()
  @IsOptional()
  razorpay_order_id?: string;

  @IsString()
  @IsOptional()
  receipt?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  razorpay_created_at?: number;
}
