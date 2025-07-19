import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductGatewayService {
  constructor(
    @Inject('CATALOG_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  async createProduct(createProductDto: CreateProductDto) {
    return await firstValueFrom(
      this.productClient.send({ cmd: 'add_product' }, createProductDto),
    );
  }
}