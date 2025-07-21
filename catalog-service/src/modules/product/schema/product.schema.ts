import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock'
}

export enum Gender {
  MEN = 'men',
  WOMEN = 'women',
  UNISEX = 'unisex',
  KIDS = 'kids'
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  shortDescription: string;

  @Prop({ required: true })
  sku: string;

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brand: Types.ObjectId;


  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], required: true })
  categories: Types.ObjectId[];

  @Prop({ required: true, enum: Gender })
  gender: Gender;

  @Prop({ required: true, enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Prop({ required: true })
  originalPrice: number;


  @Prop([String])
  images: string[];

  @Prop([String])
  tags: string[];

  @Prop({ type: Map, of: String })
  specifications: Map<string, string>;


  @Prop({
    type: [String],
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    default: [],
  })
  sizes: string[];

  @Prop()
  material: string;

  @Prop()
  careInstructions: string;

  @Prop()
  origin: string;

  @Prop({ default: 0 })
  weight: number;

  @Prop({ type: Object })
  dimensions: {
    length: number;
    width: number;
    height: number;
  };



  @Prop({ default: 0 })
  totalStock: number;

  @Prop({ default: 0 })
  soldCount: number;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: 0 })
  wishlistCount: number;




  @Prop({ default: true })
  isReturnable: boolean;

  @Prop({ default: 7 })
  returnDays: number;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: false })
  isNewArrival: boolean;

  @Prop([String])
  features: string[];

  @Prop({ type: Map, of: String })
  specs: Map<string, string>;

  @Prop({ type: Map, of: String })
  care: Map<string, string>;

  @Prop([{ type: Types.ObjectId, ref: 'Review' }])
  reviews: Types.ObjectId[];

  @Prop([{
    type: {
      name: { type: String, required: true },
      value: { type: String, required: true },
      inStock: { type: Boolean, default: true }
    }
  }])
  colors: { name: string; value: string; inStock: boolean }[];




  @Prop({ type: Date })
  launchDate: Date;

}

export const ProductSchema = SchemaFactory.createForClass(Product);