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

}