import { IsString, IsNumber, IsBoolean, IsOptional, IsEmail } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  payment_id: string;

  @IsString()
  entity: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  status: string;

  @IsString()
  order_id: string;

  @IsOptional()
  @IsString()
  invoice_id?: string;

  @IsBoolean()
  international: boolean;

  @IsString()
  method: string;

  @IsNumber()
  amount_refunded: number;

  @IsOptional()
  @IsString()
  refund_status?: string;

  @IsBoolean()
  captured: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  card_id?: string;

  @IsOptional()
  @IsString()
  bank?: string;

  @IsOptional()
  @IsString()
  wallet?: string;

  @IsOptional()
  @IsString()
  vpa?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsNumber()
  fee?: number;

  @IsOptional()
  @IsNumber()
  tax?: number;

  @IsOptional()
  @IsString()
  error_code?: string;

  @IsOptional()
  @IsString()
  error_description?: string;

  @IsOptional()
  @IsString()
  error_source?: string;

  @IsOptional()
  @IsString()
  error_step?: string;

  @IsOptional()
  @IsString()
  error_reason?: string;

  @IsOptional()
  @IsString()
  bank_transaction_id?: string;

  @IsNumber()
  payment_created_at: number;
}