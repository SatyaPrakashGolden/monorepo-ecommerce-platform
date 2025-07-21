import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { errorResponse, successResponse } from '../../utils/error.util';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  // REST API
  @Post('add-review')
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    try {
      const review = await this.reviewService.createReview(createReviewDto);
      return successResponse(review, 'Review created successfully'); // ✅ fixed
    } catch (error) {
      throw errorResponse(error, 'Failed to create review', 400, false) as HttpException;
    }
  }


  @MessagePattern('create-review')
  async handleCreateReview(@Payload() createReviewDto: CreateReviewDto) {
    try {
      const review = await this.reviewService.createReview(createReviewDto);
      return successResponse(review, 'Review created successfully'); // ✅ Corrected

    } catch (error) {
      return errorResponse(error, 'Failed to create review', 400, true); // ✅ Also use error object correctly
    }
  }

}
