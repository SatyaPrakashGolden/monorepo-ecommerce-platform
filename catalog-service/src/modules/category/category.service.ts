import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import slugify from 'slugify';

import { Category, CategoryDocument } from './schema/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  private async generateUniqueSlug(name: string): Promise<string> {
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists in DB
    while (await this.categoryModel.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    return slug;
  }

  async create(createDto: CreateCategoryDto): Promise<Category> {
    if (!createDto.name) {
      throw new BadRequestException('Name is required to generate slug');
    }

    const slug = await this.generateUniqueSlug(createDto.name);

    const newCategory = new this.categoryModel({
      ...createDto,
      slug,
    });

    return newCategory.save();
  }


}


