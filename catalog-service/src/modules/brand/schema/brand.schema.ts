import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true })
export class Brand {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop()
  logo: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  website: string;


}

export const BrandSchema = SchemaFactory.createForClass(Brand);