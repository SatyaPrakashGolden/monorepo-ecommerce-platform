import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class PaymentCallbackDto {
  @IsOptional()
  @IsString()
  razorpay_payment_id?: string;

  @IsOptional()
  @IsString()
  razorpay_order_id?: string; // Correctly defined

  @IsOptional()
  @IsString()
  razorpay_signature?: string;

  @IsOptional()
  @IsBoolean()
  isFailedPayment?: boolean;

  @IsOptional()
  error?: {
    metadata?: string;
  };
}