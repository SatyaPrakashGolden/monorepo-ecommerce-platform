import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer, OfferDocument } from './schema/offer.schema';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OfferService {
  constructor(
    @InjectModel(Offer.name) private offerModel: Model<OfferDocument>,
  ) {}

  async create(createOfferDto: CreateOfferDto): Promise<Offer> {
    // Optional: Check for duplicate name or overlapping date range
    const existingOffer = await this.offerModel.findOne({
      name: createOfferDto.name,
    });

    if (existingOffer) {
      throw new BadRequestException('Offer with this name already exists.');
    }

    const newOffer = new this.offerModel(createOfferDto);
    return newOffer.save();
  }
}
