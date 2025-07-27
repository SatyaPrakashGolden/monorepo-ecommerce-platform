import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SizeName } from '../../product/schema/product.schema'; 

export type CartDocument = Cart & Document;

/**
 * Embedded schema for a single item in the cart
 */
@Schema({ _id: false })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ type: String, enum: SizeName, required: true })
  size: SizeName;

  @Prop({ type: String, required: true }) // e.g., "Black", "Red"
  color: string;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

/**
 * Main cart schema, which contains an array of cart items and optional user reference
 */
@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user?: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
