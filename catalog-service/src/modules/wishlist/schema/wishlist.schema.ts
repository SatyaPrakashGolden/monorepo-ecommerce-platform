import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WishlistDocument = Wishlist & Document;

@Schema({ timestamps: true })
export class Wishlist {
  // MySQL User ID (number, not ObjectId)
  @Prop({ type: Number, required: true })
  userId: number;

  // Array of products added to wishlist
  @Prop([
    {
      type: {
        product: { type: Types.ObjectId, ref: 'Product', required: true },
        addedAt: { type: Date, default: Date.now }
      },
      _id: false
    }
  ])
  products: {
    product: Types.ObjectId;
    addedAt: Date;
  }[];
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

// Optional: Ensure one wishlist per MySQL user
WishlistSchema.index({ userId: 1 }, { unique: true });
