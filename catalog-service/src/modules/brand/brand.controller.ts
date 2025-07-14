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
}
