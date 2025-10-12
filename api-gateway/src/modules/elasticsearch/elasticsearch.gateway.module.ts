import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SearchGatewayController } from './elasticsearch.gateway.controller';
import { ElasticsearchGatewayService } from './elasticsearch.gateway.service';
import { ProductGatewayModule } from '../product/product.gateway.module';

@Module({
  imports: [
    // Register the microservice client
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

    ProductGatewayModule,
  ],
  controllers: [SearchGatewayController],
  providers: [ElasticsearchGatewayService],
})
export class ElasticsearchGatewayModule {}
