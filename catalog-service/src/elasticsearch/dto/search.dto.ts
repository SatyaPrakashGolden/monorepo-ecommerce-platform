import { IsOptional, IsString, IsInt, Min, IsEnum, IsArray, ValidateIf, IsBoolean } from 'class-validator';
import { ProductStatus, Gender } from '../../modules/product/schema/product.schema'; // Adjust path as needed

export class SearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  page?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsBoolean()
  includeAggregations?: boolean = false;

  @IsOptional()
  filters?: {
    status?: ProductStatus;
    gender?: Gender;
    categories?: string[]; // Category IDs
    brands?: string[]; // Brand IDs
    minPrice?: number;
    maxPrice?: number;
  };
}