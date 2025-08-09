import { IsNumber, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @IsOptional()
  user_id?: number;

  @IsString()
  product_id: string;

  @IsNumber()
  total_amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @IsObject()
  @IsOptional()
  checkout_data?: {
    cartItems: Array<{
      productId: string;
      name: string;
      price: number;
      image: string;
      size: string;
      color: string;
      quantity: number;
    }>;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };

  @IsString()
  @IsOptional()
  saga_id?: string;

  @IsString()
  @IsOptional()
  status?: string;
}