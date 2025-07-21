import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer, OfferDocument } from './schema/offer.schema';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OfferService {
  constructor(@InjectModel(Offer.name) private offerModel: Model<OfferDocument>) {}

  async create(createOfferDto: CreateOfferDto): Promise<Offer> {
    const offerCode = createOfferDto.code.toUpperCase();
    const existingOffer = await this.offerModel.findOne({ code: offerCode });

    if (existingOffer) {
      throw new BadRequestException('Offer code must be unique.');
    }
    
    const newOffer = new this.offerModel({
      ...createOfferDto,
      code: offerCode,
    });

    return newOffer.save();
  }
}