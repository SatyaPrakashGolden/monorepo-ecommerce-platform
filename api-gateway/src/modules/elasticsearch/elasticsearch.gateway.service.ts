import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ProductGatewayService } from '../product/product.gateway.service';

@Injectable()
export class ElasticsearchGatewayService {
  constructor(
    @Inject('CATALOG_SERVICE') private readonly elasticsearchClient: ClientProxy,
    private readonly productGatewayService: ProductGatewayService,
  ) { }

  async fullTextSearch(searchDto: any) {
    try {
      const esResponse = await firstValueFrom(
        this.elasticsearchClient.send({ cmd: 'search_full_text' }, searchDto),
      );
      if (!esResponse || !esResponse.data || esResponse.data.length === 0) {
        return esResponse.data;
      }
      const productIds = esResponse.data.map((item: any) => item.id);
      const products = await this.productGatewayService.getProductsByIds(productIds);
      return products;
    } catch (error) {
      console.error('[ElasticsearchGatewayService] fullTextSearch error:', error);
      throw error;
    }
  }
}
