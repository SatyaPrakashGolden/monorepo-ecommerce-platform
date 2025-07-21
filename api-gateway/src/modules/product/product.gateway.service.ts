import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductGatewayService {
  constructor(
    @Inject('CATALOG_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  async createProduct(productData: Record<string, any>) {
    return await firstValueFrom(
      this.productClient.send({ cmd: 'add_product' }, productData),
    );
  }
}
