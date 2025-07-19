import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify'; // 👈 Import slugify
import { Product, ProductDocument } from './schema/product.schema';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}
  
  // 👇 Add this helper function
  private async generateUniqueSlug(name: string): Promise<string> {
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    
    while (await this.productModel.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }
    
    return slug;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // 👇 Add this logic to generate and assign the slug
    if (!createProductDto.name) {
      throw new BadRequestException('Product name is required to generate a slug.');
    }
    
    const slug = await this.generateUniqueSlug(createProductDto.name);
    
    const newProduct = new this.productModel({
      ...createProductDto,
      slug, // Assign the generated slug
    });
    
    return newProduct.save();
  }
}