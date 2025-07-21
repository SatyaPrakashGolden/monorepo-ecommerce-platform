// schemas/review.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type ReviewDocument = Review & Document;
@Schema({
  timestamps: true,
  collection: 'reviews'
})
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Purchase' })
  purchaseId?: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: false })
  isVerifiedPurchase: boolean;

  @Prop()
  sizePurchased?: string;

  @Prop({ enum: ['True to size', 'Runs small', 'Runs large'] })
  fitFeedback?: string;

  @Prop({ default: 0 })
  helpfulCount: number;

  @Prop({ default: true })
  isVisible: boolean;

  @Prop({ required: true })
  reviewDate: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Create indexes for better performance
ReviewSchema.index({ productId: 1, rating: -1 });
ReviewSchema.index({ productId: 1, reviewDate: -1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ isVerifiedPurchase: 1 });

// schemas/review-summary.schema.ts
export type ReviewSummaryDocument = ReviewSummary & Document;

@Schema({
  timestamps: true,
  collection: 'reviewSummaries'
})
export class ReviewSummary {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, unique: true })
  productId: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  totalReviews: number;

  @Prop({ required: true, default: 0 })
  averageRating: number;

  @Prop({
    type: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    },
    default: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };

  @Prop({ default: 0 })
  verifiedPurchaseCount: number;
}

export const ReviewSummarySchema = SchemaFactory.createForClass(ReviewSummary);