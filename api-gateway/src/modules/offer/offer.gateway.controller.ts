import { Controller, Post, Body } from '@nestjs/common';
import { OfferGatewayService } from './offer.gateway.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { successResponse, throwHttpFormattedError } from '../../utils/error.util';

@Controller('offer')
export class OfferController {
  constructor(
    private readonly offerGatewayService: OfferGatewayService,
  ) {}

  @Post('add-offer')
  async addOffer(@Body() offerData: CreateOfferDto) {
    try {
      const result = await this.offerGatewayService.createOffer(offerData);
      return successResponse(result, 'Offer added successfully');
    } catch (error) {
      throwHttpFormattedError(error);
    }
  }
}