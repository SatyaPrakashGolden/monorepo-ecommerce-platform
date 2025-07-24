import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OfferGatewayService {
  constructor(
    @Inject('CATALOG_SERVICE') private readonly offerClient: ClientProxy,
  ) {}

  async createOffer(createOfferDto: any) {
    return await firstValueFrom(
      this.offerClient.send({ cmd: 'add_offer' }, createOfferDto),
    );
  }
}