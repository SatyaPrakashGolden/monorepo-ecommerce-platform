// /home/satya/myproject/api-gateway/src/modules/brand/brand.gateway.module.ts

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { BrandController } from './brand.gateway.controller';
import { BrandGatewayService } from './brand.gateway.service';

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
  controllers: [BrandController],
  providers: [BrandGatewayService],
  exports: [BrandGatewayService], 
})
export class BrandGatewayModule {}
