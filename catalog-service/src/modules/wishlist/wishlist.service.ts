import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './schema/wishlist.schema';
import { Product, ProductDocument } from '../product/schema/product.schema'; 

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name)
    private readonly wishlistModel: Model<WishlistDocument>,

    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  /**
   * Add a product to user's wishlist
   */
  async addToWishlist(userId: number, productId: string): Promise<WishlistDocument> {
    const isValidProduct = await this.productModel.exists({ _id: productId });
    if (!isValidProduct) {
      throw new NotFoundException('Product not found');
    }

    let wishlist = await this.wishlistModel.findOne({ userId });

    if (!wishlist) {
      // Create new wishlist
      wishlist = new this.wishlistModel({
        userId,
        products: [{ product: new Types.ObjectId(productId) }],
      });
    } else {
      const exists = wishlist.products.some(
        (item) => item.product.toString() === productId,
      );

      if (exists) {
        throw new ConflictException('Product already in wishlist');
      }

      wishlist.products.push({
        product: new Types.ObjectId(productId),
        addedAt: new Date(),
      });
    }

    return wishlist.save();
  }

  /**
   * Remove a product from the wishlist
   */
  async removeFromWishlist(userId: number, productId: string): Promise<WishlistDocument> {
    const wishlist = await this.wishlistModel.findOne({ userId });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const originalLength = wishlist.products.length;

    wishlist.products = wishlist.products.filter(
      (item) => item.product.toString() !== productId,
    );

    if (wishlist.products.length === originalLength) {
      throw new NotFoundException('Product not found in wishlist');
    }

    return wishlist.save();
  }

  /**
   * Get a user's wishlist with populated product details
   */
  async getUserWishlist(userId: number): Promise<WishlistDocument> {
    const wishlist = await this.wishlistModel
      .findOne({ userId })
      .populate('products.product');

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    return wishlist;
  }

  /**
   * Clear entire wishlist
   */
  async clearWishlist(userId: number): Promise<{ message: string }> {
    const wishlist = await this.wishlistModel.findOne({ userId });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    wishlist.products = [];
    await wishlist.save();

    return { message: 'Wishlist cleared successfully' };
  }
  
}
