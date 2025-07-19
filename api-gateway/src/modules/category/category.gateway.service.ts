import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryGatewayService {
  constructor(
    @Inject('CATALOG_SERVICE') private readonly categoryClient: ClientProxy,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    return await firstValueFrom(
      this.categoryClient.send({ cmd: 'add_category' }, createCategoryDto),
    );
  }
}