import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsBoolean,
  IsDateString,
  ValidateNested,
  IsObject,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, ProductStatus, SizeName } from '../schema/product.schema';


export class SizeDto {
  @IsEnum(SizeName)
  name: SizeName;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;
}

export class ColorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;
}

export class DimensionsDto {
  @IsNumber()
  length: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsArray()
  @ArrayNotEmpty()
  categories: string[];

  @IsEnum(Gender)
  gender: Gender;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsNumber()
  originalPrice: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsOptional()
  @IsObject()
  specifications?: Record<string, string>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeDto)
  @IsOptional()
  sizes?: SizeDto[];

  @IsString()
  @IsOptional()
  material?: string;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @ValidateNested()
  @Type(() => DimensionsDto)
  @IsOptional()
  dimensions?: DimensionsDto;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsNumber()
  @IsOptional()
  stockCount?: number;

  @IsNumber()
  @IsOptional()
  soldCount?: number;

  @IsNumber()
  @IsOptional()
  wishlistCount?: number;

  @IsBoolean()
  @IsOptional()
  isReturnable?: boolean;

  @IsNumber()
  @IsOptional()
  returnDays?: number;

  @IsBoolean()
  @IsOptional()
  isNewArrival?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  careInstructions?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  reviews?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColorDto)
  @IsOptional()
  colors?: ColorDto[];

  @IsDateString()
  @IsOptional()
  launchDate?: Date;


  @IsBoolean()
  @IsOptional()
  isNew?: boolean;

  @IsBoolean()
  @IsOptional()
  isSale?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  offers?: string[];

}
