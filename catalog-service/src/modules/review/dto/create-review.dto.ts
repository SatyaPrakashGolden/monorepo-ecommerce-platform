import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsMongoId,
  IsEnum,
  IsBoolean,
  IsDateString
} from 'class-validator';

export enum FitFeedbackEnum {
  TRUE_TO_SIZE = 'True to size',
  RUNS_SMALL = 'Runs small',
  RUNS_LARGE = 'Runs large'
}

export class CreateReviewDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsMongoId()
  @IsOptional()
  purchaseId?: string;

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

  @IsBoolean()
  @IsOptional()
  isVerifiedPurchase?: boolean = false;

  @IsString()
  @IsOptional()
  sizePurchased?: string;

  @IsEnum(FitFeedbackEnum)
  @IsOptional()
  fitFeedback?: FitFeedbackEnum;

  @IsDateString()
  @IsNotEmpty()
  reviewDate: string;
}
