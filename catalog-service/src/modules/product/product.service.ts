import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { Product, ProductDocument } from './schema/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { uploadFileToS3 } from '../../utils/s3-upload';
import { Types } from 'mongoose';
@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  private async generateUniqueSlug(name: string): Promise<string> {
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await this.productModel.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    return slug;
  }

  private async generateUniqueSKU(prefix: string = 'SKU'): Promise<string> {
    let sku: string;
    let counter = 1;

    do {
      const randomPart = Math.floor(100000 + Math.random() * 900000); 
      sku = `${prefix}-${randomPart}`;
      counter++;
    } while (await this.productModel.exists({ sku }));

    return sku;
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }



async create(createProductDto: CreateProductDto): Promise<Product> {
  const { name, brand, reviews } = createProductDto;

  if (!name) {
    throw new BadRequestException('Product name is required to generate a slug.');
  }

  // Validate Brand exists
  const brandExists = await this.productModel.db
    .collection('brands')
    .findOne({ _id: new Types.ObjectId(brand) });

  if (!brandExists) {
    throw new BadRequestException('Invalid brand ID. Brand not found.');
  }


 
  const slug = await this.generateUniqueSlug(name);
  const sku = await this.generateUniqueSKU();

  const newProduct = new this.productModel({
    ...createProductDto,
    slug,
    sku,
  });

  return newProduct.save();
}


}


