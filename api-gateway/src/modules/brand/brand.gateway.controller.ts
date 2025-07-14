//monorepo-ecommerce-platform/api-gateway/src/modules/brand/brand.gateway.controller.ts

import {
  Controller,
  Post,
  Body,
  Param,
  Get
} from '@nestjs/common';

import { BrandGatewayService } from './brand.gateway.service';
import { errorResponseGateway, successResponse } from '../../utils/error.util';
import { CreateBrandDto } from './dto/create-brand.dto'; 
import { get } from 'http';

@Controller('brand')
export class BrandController {
  constructor(
    private readonly brandGatewayService: BrandGatewayService,
  ) {}

  @Post('add-brand')
  async addBrand(@Body() brandData: CreateBrandDto) {
    try {
      const result = await this.brandGatewayService.createBrand(brandData);
      return successResponse(result, 'Brand added successfully');
    } catch (error) {
      throw errorResponseGateway(error, 'Failed to add brand');
    }
  }

@Get(':id')
async getBrand(@Param('id') id: string) {
  try {
    const result = await this.brandGatewayService.getBrandById(id);
    return successResponse(result, 'Brand fetched successfully');
  } catch (error) {
    throw errorResponseGateway(error, 'Failed to fetch brand');
  }
}
@Get('name/:name')
async getBrandByName(@Param('name') name: string) {
  console.log('[GatewayController] Route param:', name); // 🔍
  try {
    const result = await this.brandGatewayService.getBrandByName(name);
    
    return successResponse(result, 'Brand fetched by name');
  } catch (error) {
    
    throw errorResponseGateway(error, 'Failed to fetch brand by name');
  }
}
}
