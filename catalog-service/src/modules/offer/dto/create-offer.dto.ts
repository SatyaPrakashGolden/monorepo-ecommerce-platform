import { IsString, IsNotEmpty, IsNumber, IsDateString, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validUntil: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}