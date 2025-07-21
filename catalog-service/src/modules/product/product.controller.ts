
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { errorResponse, successResponse } from '../../utils/error.util';
import {
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Controller, Post, Body,
  Get
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadFileToS3 } from '../../utils/s3-upload';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }


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

  @Get('get-all')
  async findAll() {
    return await this.productService.findAll();
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