import { Controller, Post, Body } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { errorResponse, successResponse } from '../../utils/error.util';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: 'add_product' })
  async addProduct(@Payload() createProductDto: CreateProductDto) {
    try {
      const result = await this.productService.create(createProductDto);
      return successResponse(result, 'Product created successfully');
    } catch (error) {
      throw errorResponse(error, 'Failed to create product');
    }
  }
}