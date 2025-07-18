import { IsString, IsNotEmpty, IsArray, IsEnum, IsNumber, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock'
}

export enum Gender {
  MEN = 'men',
  WOMEN = 'women',
  UNISEX = 'unisex',
  KIDS = 'kids'
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
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsArray()
  @IsNotEmpty()
  categories: string[];

  @IsEnum(Gender)
  gender: Gender;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsNumber()
  basePrice: number;

  @IsNumber()
  @IsOptional()
  discountPrice?: number;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  material?: string;

  @IsString()
  @IsOptional()
  careInstructions?: string;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsBoolean()
  @IsOptional()
  isReturnable?: boolean;

  @IsNumber()
  @IsOptional()
  returnDays?: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isNewArrival?: boolean;

  @IsDateString()
  @IsOptional()
  launchDate?: string;
}