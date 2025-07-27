import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schema/cart.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { RemoveCartItemDto } from './dto/remove-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>
  ) {}

  async getCartByUser(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  async addToCart(userId: string, dto: AddToCartDto): Promise<Cart> {
    let cart = await this.cartModel.findOne({ user: userId });

    const newItem = {
      product: new Types.ObjectId(dto.product),
      size: dto.size,
      color: dto.color,
      quantity: dto.quantity,
    };

    if (!cart) {
      cart = new this.cartModel({
        user: userId,
        items: [newItem],
      });
    } else {
      const existingItem = cart.items.find(
        (item) =>
          item.product.toString() === dto.product &&
          item.size === dto.size &&
          item.color === dto.color,
      );

      if (existingItem) {
        existingItem.quantity += dto.quantity;
      } else {
        cart.items.push(newItem);
      }
    }

    return cart.save();
  }



  async removeCartItem(userId: string, dto: RemoveCartItemDto): Promise<Cart> {
    const cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.toString() === dto.product &&
          item.size === dto.size &&
          item.color === dto.color
        ),
    );

    return cart.save();
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = [];
    return cart.save();
  }
}
