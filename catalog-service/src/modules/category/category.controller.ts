

// /home/satya/myproject/catalog-service/src/modules/category/category.controller.ts

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { errorResponse, successResponse } from '../../utils/error.util';

@Controller() // The 'categories' route is no longer needed here
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @MessagePattern({ cmd: 'add_category' })
  async addCategoryMessage(@Payload() createDto: CreateCategoryDto) {
    try {
      const result = await this.categoryService.create(createDto);
      return successResponse(result, 'Category created successfully');
    } catch (error) {
      // Use the error utility to throw an RpcException
      throw errorResponse(error, 'Failed to create category', 500, true);
    }
  }
}
