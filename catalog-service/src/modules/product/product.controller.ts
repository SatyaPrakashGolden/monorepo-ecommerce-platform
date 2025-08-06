
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { errorResponse, successResponse } from '../../utils/error.util';
import {
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Controller, Post, Body,
  Get, Param
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadFileToS3 } from '../../utils/s3-upload';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @MessagePattern({ cmd: 'reserve_stock' })
  async reserveStock(@Payload() payload: { productId: string; quantity: number }) {
    try {
      const result = await this.productService.reserveStock(payload);
      return successResponse(result, 'Stock reserved successfully');
    } catch (error) {
      console.error(error);
      throw errorResponse(error, 'Failed to reserve stock');
    }
  }

  @MessagePattern({ cmd: 'release_stock' })
async releaseStock(@Payload() payload: { productId: string; quantity: number }) {
  try {
    const result = await this.productService.releaseStock(payload);
    return successResponse(result, 'Stock released successfully');
  } catch (error) {
    console.error(error);
    throw errorResponse(error, 'Failed to release stock');
  }
}

  @MessagePattern({ cmd: 'product_details' })
  async getProductDetailsMessage(@Payload() productId: string) {
    try {
      const result = await this.productService.findByIdWithDetails(productId);
      return result;
    } catch (error) {
      console.error(error);
      throw errorResponse(error, 'Failed to fetch product details via message pattern');
    }
  }


  @MessagePattern({ cmd: 'product_related' })
  async getRelatedProductsMessage(@Payload() productId: string) {
    try {
      const result = await this.productService.getRelatedProducts(productId);
      return result
    } catch (error) {
      console.error(error);
      throw errorResponse(error, 'Failed to fetch related products');
    }
  }


  @MessagePattern({ cmd: 'product_featured' })
  async getFeaturedProductsMessage() {
    try {
      const result = await this.productService.getFeaturedProducts();
      return result;
    } catch (error) {
      console.log(error);
      throw errorResponse(error, 'Failed to fetch featured products');
    }
  }

  @MessagePattern({ cmd: 'add_product' })
  async addProduct(@Payload() createProductDto: CreateProductDto) {
    try {
      const result = await this.productService.create(createProductDto);
      return result;
    } catch (error) {
      console.log(error)
      throw errorResponse(error, 'Failed to create product');
    }
  }

  @Post('add')
  async addProductHttp(@Body() createProductDto: CreateProductDto) {
    try {
      const result = await this.productService.create(createProductDto);
      return successResponse(result, 'Product created successfully');
    } catch (error) {
      console.log(error);
      throw errorResponse(error, 'Failed to create product');
    }
  }


  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      const imageUrl = await uploadFileToS3(file);
      return { success: true, imageUrl };
    } catch (error) {
      throw new BadRequestException('Image upload failed');
    }
  }






}