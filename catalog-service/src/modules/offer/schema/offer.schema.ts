import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Offer {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, enum: ['percentage', 'flat'] })
  discountType: 'percentage' | 'flat';

  @Prop({ required: true })
  discountValue: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: false })
  appliesToAllProducts: boolean;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }])
  appliesToProductIds?: Types.ObjectId[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }])
  appliesToCategories?: Types.ObjectId[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }])
  appliesToBrands?: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFestivalOffer: boolean;

  @Prop({ default: false })
  isStackable: boolean;
}

export type OfferDocument = Offer & Document;
export const OfferSchema = SchemaFactory.createForClass(Offer);
