import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreatePaymentFailureDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  orderId: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  paymentId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  errorCode: string;

  @IsString()
  @IsNotEmpty()
  errorDescription: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  errorReason: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  type: string;
}
