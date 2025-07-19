import { Controller, Post, Body } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { errorResponse, successResponse } from '../../utils/error.util';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @MessagePattern({ cmd: 'add_review' })
  async addReview(@Payload() createReviewDto: CreateReviewDto) {
    try {
      const result = await this.reviewService.create(createReviewDto);
      return successResponse(result, 'Review created successfully');
    } catch (error) {
      throw errorResponse(error, 'Failed to create review');
    }
  }
}