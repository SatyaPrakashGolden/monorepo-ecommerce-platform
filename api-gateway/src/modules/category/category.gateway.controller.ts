import { Controller, Post, Body } from '@nestjs/common';
import { CategoryGatewayService } from './category.gateway.service';
import { CreateCategoryDto } from './dto/create-category.dto';

import { successResponse, throwHttpFormattedError } from '../../utils/error.util';
@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryGatewayService: CategoryGatewayService,
  ) {}

  @Post('add-category')
  async addCategory(@Body() categoryData: CreateCategoryDto) {
    try {
      const result = await this.categoryGatewayService.createCategory(categoryData);
      return successResponse(result, 'Category added successfully');
    } catch (error) {
      throwHttpFormattedError(error);
    }
  }
}
