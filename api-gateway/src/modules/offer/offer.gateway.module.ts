import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OfferController } from './offer.gateway.controller';
import { OfferGatewayService } from './offer.gateway.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CATALOG_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4001,
        },
      },
    ]),
  ],
  controllers: [OfferController],
  providers: [OfferGatewayService],
})
export class OfferGatewayModule {}