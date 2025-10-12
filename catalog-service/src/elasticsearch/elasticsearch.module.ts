// src/elasticsearch/elasticsearch.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ElasticsearchService } from './elasticsearch.service';
import { SearchController } from './elasticsearch.controller';

// Import schemas
import { Brand, BrandSchema } from '../modules/brand/schema/brand.schema';
import { Category, CategorySchema } from '../modules/category/schema/category.schema';
import { Product, ProductSchema } from '../modules/product/schema/product.schema';

@Module({
  imports: [
    // Register Mongoose models for injection
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]), // optional
  ],
  controllers: [SearchController],
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
