import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CategoryController } from './category.gateway.controller';
import { CategoryGatewayService } from './category.gateway.service';

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
  controllers: [CategoryController],
  providers: [CategoryGatewayService],
})
export class CategoryGatewayModule {}