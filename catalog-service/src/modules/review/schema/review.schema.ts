import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  userId: string; 

  @Prop({ required: true })
  userName: string;
  
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  comment: string;

  @Prop([String])
  images: string[];

  @Prop({ required: true, enum: ReviewStatus, default: ReviewStatus.PENDING })
  status: ReviewStatus;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);