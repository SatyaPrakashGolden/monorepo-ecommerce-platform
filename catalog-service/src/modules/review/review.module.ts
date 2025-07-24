import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review, ReviewSchema } from './schema/review.schema';
import { ReviewSummary, ReviewSummarySchema } from './schema/review.schema'; 
import {ProductModule} from '../product/product.module'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: ReviewSummary.name, schema: ReviewSummarySchema },
    ]),
    ProductModule, 
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}

