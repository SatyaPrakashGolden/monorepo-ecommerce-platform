import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProductController } from './product.gateway.controller';
import { ProductGatewayService } from './product.gateway.service';

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
  controllers: [ProductController],
  providers: [ProductGatewayService],
  exports: [ProductGatewayService],
})
export class ProductGatewayModule {}