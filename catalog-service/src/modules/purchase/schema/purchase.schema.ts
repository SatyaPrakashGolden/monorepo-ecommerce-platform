import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PurchaseDocument = Purchase & Document;

@Schema({
  timestamps: true,
  collection: 'purchases'
})
export class Purchase {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  size: string;

  @Prop()
  color?: string;

  @Prop({ required: true })
  purchaseDate: Date;

  @Prop({ default: 'completed' })
  status: string;

  @Prop({ required: true })
  orderId: string;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);