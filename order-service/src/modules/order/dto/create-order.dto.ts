import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

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

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  image: string;

  @IsString()
  size: string;

  @IsString()
  color: string;

  @IsNumber()
  quantity: number;
}
