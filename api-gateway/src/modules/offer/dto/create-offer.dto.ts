import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDate,
  IsArray,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FLAT = 'flat',
}

export class CreateOfferDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber()
  discountValue: number;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsBoolean()
  appliesToAllProducts: boolean = false;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  appliesToProductIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  appliesToCategories?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  appliesToBrands?: string[];

  @IsOptional()
  @IsBoolean()
  isActive: boolean = true;

  @IsOptional()
  @IsBoolean()
  isFestivalOffer: boolean = false;

  @IsOptional()
  @IsBoolean()
  isStackable: boolean = false;
}
