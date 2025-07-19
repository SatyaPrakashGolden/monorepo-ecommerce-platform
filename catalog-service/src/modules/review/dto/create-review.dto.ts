import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsEnum, Min, Max } from 'class-validator';
import { ReviewStatus } from '../schema/review.schema';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  product: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsEnum(ReviewStatus)
  @IsOptional()
  status?: ReviewStatus;
}