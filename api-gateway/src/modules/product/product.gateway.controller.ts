import { Controller, Post, Body } from '@nestjs/common';
import { ProductGatewayService } from './product.gateway.service';
import { successResponse, throwHttpFormattedError } from '../../utils/error.util';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productGatewayService: ProductGatewayService,
  ) {}

  @Post('add-product')
  async addProduct(@Body() productData: Record<string, any>) {
    try {
      const result = await this.productGatewayService.createProduct(productData);
      return successResponse(result, 'Product added successfully');
    } catch (error) {
      throwHttpFormattedError(error);
    }
  }
}
