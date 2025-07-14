//monorepo-ecommerce-platform/api-gateway/src/modules/brand/brand.gateway.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateBrandDto } from './dto/create-brand.dto';

@Injectable()
export class BrandGatewayService {
  constructor(
    @Inject('CATALOG_SERVICE') private readonly brandClient: ClientProxy,
  ) {}

  async createBrand(createBrandDto: CreateBrandDto) {
    return await firstValueFrom(
      this.brandClient.send({ cmd: 'add_brand' }, createBrandDto),
    );
  }
  async getBrandById(id: string) {
  return await firstValueFrom(
    this.brandClient.send({ cmd: 'get_brand_by_id' }, id),
  );
}

async getBrandByName(name: string) {
  
  return await firstValueFrom(
    this.brandClient.send({ cmd: 'get_brand_by_name' }, name),
  );
}




}