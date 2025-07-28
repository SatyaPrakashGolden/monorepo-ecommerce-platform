///monorepo-ecommerce-platform/catalog-service/src/modules/brand/brand.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from './schema/brand.schema'; 
import slugify from 'slugify';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';




@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name)
    private brandModel: Model<BrandDocument>,
  ) {}



  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const slug = slugify(createBrandDto.name, { lower: true });
    const brandExists = await this.brandModel.findOne({ slug });
    if (brandExists) {
      throw new BadRequestException('Brand with this slug already exists');
    }
    const createdBrand = new this.brandModel({ ...createBrandDto, slug });
    return createdBrand.save();
  }



  async findAll(): Promise<Brand[]> {
    return this.brandModel.find().exec();
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandModel.findById(id).exec();
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    if (updateBrandDto.name) {
      updateBrandDto.slug = slugify(updateBrandDto.name, { lower: true });
    }

    const updatedBrand = await this.brandModel.findByIdAndUpdate(
      id,
      updateBrandDto,
      { new: true },
    );

    if (!updatedBrand) {
      throw new NotFoundException('Brand not found');
    }
    return updatedBrand;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.brandModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Brand not found');
    }
    return { message: 'Brand deleted successfully' };
  }

async findByName(name: string): Promise<Brand> {
  
  const brand = await this.brandModel.findOne({ name }).exec();
  if (!brand) {
   
    throw new NotFoundException('Brand not found with the given name');
  }
  return brand;
}


}

