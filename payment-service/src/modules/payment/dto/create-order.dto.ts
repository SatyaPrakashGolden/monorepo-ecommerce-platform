// /home/satya/carbike360evBackend/ecommerceBackend/payment-service/src/modules/payment/dto/create-order.dto.ts
import { IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateOrderDto {
  @IsNumber({}, { message: 'Amount must be a number' })
  amount: number; // amount in rupees (INR)

  @IsOptional()
  @IsIn(['INR'], { message: 'Currency must be INR' })
  currency?: string; // default 'INR'
}