import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schema/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(@InjectModel(Review.name) private reviewModel: Model<ReviewDocument>) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const newReview = new this.reviewModel(createReviewDto);
    return newReview.save();
  }
}