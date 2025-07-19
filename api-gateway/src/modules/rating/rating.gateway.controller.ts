import { Controller, Post, Body } from '@nestjs/common';
import { RatingGatewayService } from './rating.gateway.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { successResponse, throwHttpFormattedError } from '../../utils/error.util';

@Controller('rating')
export class RatingController {
  constructor(
    private readonly ratingGatewayService: RatingGatewayService,
  ) {}

  @Post('add-rating')
  async addRating(@Body() ratingData: CreateRatingDto) {
    try {
      const result = await this.ratingGatewayService.createRating(ratingData);
      return successResponse(result, 'Rating added successfully');
    } catch (error) {
      throwHttpFormattedError(error);
    }
  }
}