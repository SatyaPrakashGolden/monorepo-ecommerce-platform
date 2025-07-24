import { IsMongoId, IsNumber, IsOptional } from 'class-validator';

export class ReviewSummaryDto {
  @IsMongoId()
  productId: string;

  @IsNumber()
  totalReviews: number;

  @IsNumber()
  averageRating: number;

  @IsOptional()
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };

  @IsNumber()
  @IsOptional()
  verifiedPurchaseCount?: number;
}
