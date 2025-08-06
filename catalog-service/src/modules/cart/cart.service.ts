import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schema/cart.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { RemoveCartItemDto } from './dto/remove-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-to-cart'
@Injectable()
export class CartService {
    constructor(
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>
    ) { }

    async getCartByUser(userId: number): Promise<any> {
        const cart = await this.cartModel
            .findOne({ userId })
            .populate('items.product', 'name images') // populate name & images only
            .lean();

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        const formattedItems = cart.items.map((item) => {
            const product = item.product as any; // 👈 cast to any
            return {
                productId: product._id,
                name: product.name,
                image: product.images?.[0] || null,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
            };
        });

        return {
            userId: cart.userId,
            items: formattedItems,
        };
    }


    async addToCart(userId: string, dto: AddToCartDto): Promise<Cart> {
        const numericUserId = Number(userId);

        let cart = await this.cartModel.findOne({ userId: numericUserId });

        const newItem = {
            product: new Types.ObjectId(dto.product),
            size: dto.size,
            color: dto.color,
            quantity: dto.quantity,
        };

        if (!cart) {
            cart = new this.cartModel({
                userId: numericUserId,
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






    async clearCart(userId: number): Promise<Cart> {
        const numericUserId = Number(userId);

        const cart = await this.cartModel.findOne({ userId: numericUserId });
        if (!cart) throw new NotFoundException('Cart not found');

        cart.items = [];
        return cart.save();
    }


    async updateCartItem(userId: number, dto: UpdateCartItemDto): Promise<Cart> {
        const cart = await this.cartModel.findOne({ userId });
        if (!cart) throw new NotFoundException('Cart not found');

        const item = cart.items.find(
            (item) =>
                item.product.toString() === dto.product &&
                item.size === dto.size &&
                item.color === dto.color,
        );

        if (!item) throw new NotFoundException('Cart item not found');

        item.quantity = dto.quantity;

        return cart.save();
    }



    async removeCartItem(userId: string, productId: string): Promise<Cart> {
        const numericUserId = Number(userId);

        const cart = await this.cartModel.findOne({ userId: numericUserId });
        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId,
        );

        return cart.save();
    }


}
