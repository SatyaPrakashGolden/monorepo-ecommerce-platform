import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RatingController } from './rating.gateway.controller';
import { RatingGatewayService } from './rating.gateway.service';

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
  controllers: [RatingController],
  providers: [RatingGatewayService],
})
export class RatingGatewayModule {}