import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
    SALE = 'sale'
}

export enum Gender {
  MEN = 'men',
  WOMEN = 'women',
  UNISEX = 'unisex',
  KIDS = 'kids'
}

export enum SizeName {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
}

@Schema({ _id: false })
export class Size {
  @Prop({ type: String, enum: SizeName, required: true })
  name: SizeName;

  @Prop({ type: Boolean, default: false })
  inStock: boolean;
}

export const SizeSchema = SchemaFactory.createForClass(Size);

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

  @Prop([{ type: Types.ObjectId, ref: 'Product' }])
  relatedProducts: Types.ObjectId[];


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


  @Prop({ type: [SizeSchema], default: [] })
  sizes: Size[];

  @Prop()
  material: string;

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

  @Prop()
  inStock: boolean;
  @Prop({ default: 0 })
  stockCount: number;
  @Prop({ default: 0 })
  soldCount: number;



  @Prop({ default: 0 })
  wishlistCount: number;



  @Prop({ default: true })
  isReturnable: boolean;

  @Prop({ default: 7 })
  returnDays: number;



  @Prop({ default: false })
  isNewArrival: boolean;

  @Prop([String])
  features: string[];


  @Prop([String])
  careInstructions: string[];


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

  @Prop({ default: false })
  isNew: boolean;

  @Prop({ default: false })
  isSale: boolean;

  @Prop([{ type: Types.ObjectId, ref: 'Offer' }])
  offers: Types.ObjectId[];


  @Prop({ type: Date })
  launchDate: Date;

}

export const ProductSchema = SchemaFactory.createForClass(Product);
