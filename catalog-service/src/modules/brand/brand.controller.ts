//monorepo-ecommerce-platform/catalog-service/src/modules/brand/schema
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { errorResponse, successResponse } from '../../utils/error.util';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @MessagePattern({ cmd: 'add_brand' })
  async addBrandMessage(@Payload() payload: CreateBrandDto) {
    try {
      const result = await this.brandService.create(payload);
      return successResponse(result, 'Brand created successfully');
    } catch (error) {
      throw errorResponse(error, 'Failed to create brand', 500, true);
    }
  }
  @MessagePattern({ cmd: 'get_brand_by_id' })
async getBrandById(@Payload() id: string) {
  try {
    const brand = await this.brandService.findOne(id);
    return successResponse(brand, 'Brand fetched successfully');
  } catch (error) {
    throw errorResponse(error, 'Failed to fetch brand', 404, true);
  }
}
   
@MessagePattern({ cmd: 'get_brand_by_name' })
async getBrandByName(@Payload() name: string) {
 
  try {
    const brand = await this.brandService.findByName(name);
 
    return successResponse(brand, 'Brand fetched successfully by name');
  } catch (error) {
  
    throw errorResponse(error, 'Failed to fetch brand by name', 404, true);
  }
}



}
