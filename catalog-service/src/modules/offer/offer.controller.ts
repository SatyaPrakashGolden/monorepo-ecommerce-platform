import { Controller } from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { errorResponse, successResponse } from '../../utils/error.util';

@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @MessagePattern({ cmd: 'add_offer' })
  async addOffer(@Payload() createOfferDto: CreateOfferDto) {
    try {
      const result = await this.offerService.create(createOfferDto);
      return successResponse(result, 'Offer created successfully');
    } catch (error) {
      throw errorResponse(error, 'Failed to create offer');
    }
  }
}