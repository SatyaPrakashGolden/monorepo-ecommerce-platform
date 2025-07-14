import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';

import { BrandGatewayService } from './brand.gateway.service';
import { errorResponseGateway, successResponse } from '../../utils/error.util';
import { CreateBrandDto } from './dto/create-brand.dto'; 

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
}
