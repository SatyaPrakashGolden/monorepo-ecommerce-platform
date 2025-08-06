import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductGatewayService {
  constructor(
    @Inject('CATALOG_SERVICE') private readonly productClient: ClientProxy,
  ) { }

  async createProduct(productData: Record<string, any>) {
    return await firstValueFrom(
      this.productClient.send({ cmd: 'add_product' }, productData),
    );
  }

  async getFeaturedProducts() {
    return await firstValueFrom(
      this.productClient.send({ cmd: 'product_featured' }, {}),
    );
  }

  async getRelatedProducts(productId: string) {
    return await firstValueFrom(
      this.productClient.send({ cmd: 'product_related' }, productId),
    );
  }

  async findByIdWithDetails(productId: string) {
    return await firstValueFrom(
      this.productClient.send({ cmd: 'product_details' }, productId),
    );
  }
  async reserveStock(productId: string, quantity: number) {
    return await firstValueFrom(
      this.productClient.send({ cmd: 'reserve_stock' }, { productId, quantity }),
    );
  }

  async releaseStock(productId: string, quantity: number) {
    return await firstValueFrom(
      this.productClient.send({ cmd: 'release_stock' }, { productId, quantity }),
    );
  }


}
