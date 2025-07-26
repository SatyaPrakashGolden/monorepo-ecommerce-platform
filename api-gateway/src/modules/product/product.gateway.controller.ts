import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ProductGatewayService } from './product.gateway.service';
import { successResponse, throwHttpFormattedError } from '../../utils/error.util';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productGatewayService: ProductGatewayService,
  ) { }


    @Get('product-details')
  async findByIdWithDetails(@Query('productId') productId: string) {
    try {
      const result = await this.productGatewayService.findByIdWithDetails(productId);
      return result;
      return successResponse(result, 'Product details fetched successfully');
    } catch (error) {
      throwHttpFormattedError(error);
    }
  }

  @Post('add-product')
  async addProduct(@Body() productData: Record<string, any>) {
    try {
      const result = await this.productGatewayService.createProduct(productData);
      return successResponse(result, 'Product added successfully');
    } catch (error) {
      throwHttpFormattedError(error);
    }
  }


  @Get('product-featured')
  async getFeaturedProducts() {
    try {
      const result = await this.productGatewayService.getFeaturedProducts();
      return successResponse(result, 'Featured products fetched successfully');
    } catch (error) {
      throwHttpFormattedError(error);
    }
  }

  @Get('product-related')
  async getRelatedProducts(@Query('productId') productId: string) {
    try {
      const result = await this.productGatewayService.getRelatedProducts(productId);
      return successResponse(result, 'Related products fetched successfully');
    } catch (error) {
      throwHttpFormattedError(error);
    }
  }

}
