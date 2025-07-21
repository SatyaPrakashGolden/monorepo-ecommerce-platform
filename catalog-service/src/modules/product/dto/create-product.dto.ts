import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
  ValidateNested,
  IsObject,
  IsDateString,
  IsMongoId,
  ArrayUnique,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus, Gender } from '../schema/product.schema';

export class DimensionDto {
  @IsNumber()
  length: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;
}

export class ColorDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  image?: string;
}

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsMongoId()
  brand: string;

  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  categories: string[];

  @IsEnum(Gender)
  gender: Gender;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsNumber()
  @Min(0)
  originalPrice: number;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsObject()
  @IsOptional()
  specifications?: Record<string, string>;

  @IsArray()
  @IsOptional()
  @IsEnum(['XS', 'S', 'M', 'L', 'XL', 'XXL'], { each: true })
  sizes?: string[];

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  careInstructions?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionDto)
  dimensions?: DimensionDto;

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  offers?: string[];

  @IsOptional()
  @IsNumber()
  totalStock?: number;

  @IsOptional()
  @IsNumber()
  soldCount?: number;

  @IsOptional()
  @IsNumber()
  viewCount?: number;

  @IsOptional()
  @IsNumber()
  wishlistCount?: number;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsNumber()
  reviewCount?: number;

  @IsOptional()
  @IsBoolean()
  isReturnable?: boolean;

  @IsOptional()
  @IsNumber()
  returnDays?: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isNewArrival?: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsObject()
  specs?: Record<string, string>;

  @IsOptional()
  @IsObject()
  care?: Record<string, string>;

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  reviews?: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ColorDto)
  colors?: ColorDto[];


  @IsOptional()
  @IsDateString()
  launchDate?: string;

  @IsOptional()
  @IsDateString()
  discontinueDate?: string;
}
