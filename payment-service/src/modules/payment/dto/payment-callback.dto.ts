import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class PaymentCallbackDto {
  @IsString()
  @IsOptional()
  razorpay_payment_id?: string;

  @IsString()
  @IsOptional()
  razorpay_order_id?: string;

  @IsString()
  @IsOptional()
  razorpay_signature?: string;

  @IsOptional()
  error?: {
    metadata?: string;
    description?: string;
  };

  @IsString()
  @IsOptional()
  saga_id?: string;

  @IsBoolean()
  @IsOptional()
  isFailedPayment?: boolean;
}