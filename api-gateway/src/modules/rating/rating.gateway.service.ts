import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingGatewayService {
  constructor(
    @Inject('CATALOG_SERVICE') private readonly ratingClient: ClientProxy,
  ) {}

  async createRating(createRatingDto: CreateRatingDto) {
    return await firstValueFrom(
      this.ratingClient.send({ cmd: 'add_review' }, createRatingDto),
    );
  }
}