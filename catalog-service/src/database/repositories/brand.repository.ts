import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from '../../modules/brand/schema/brand.schema';

@Injectable()
export class BrandRepository {
  constructor(
    @InjectModel(Brand.name)
    private readonly brandModel: Model<BrandDocument>,
  ) {}

  async create(data: Partial<Brand>): Promise<Brand> {
    const brand = new this.brandModel(data);
    return brand.save();
  }

  async findAll(): Promise<Brand[]> {
    return this.brandModel.find().exec();
  }

  async findById(id: string): Promise<Brand | null> {
    return this.brandModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<Brand | null> {
    return this.brandModel.findOne({ slug }).exec();
  }

  async update(id: string, data: Partial<Brand>): Promise<Brand | null> {
    return this.brandModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<Brand | null> {
    return this.brandModel.findByIdAndDelete(id).exec();
  }
}
