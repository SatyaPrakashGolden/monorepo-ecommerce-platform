// /home/satya/carbike360evBackend/ecommerceBackend/payment-service/src/modules/payment/dto/verify-payment.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}