import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';
import { errorResponse } from '../../utils/error.util';
import { AddToCartDto } from './dto/add-to-cart.dto';

import { RemoveCartItemDto } from './dto/remove-cart-item.dto';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

  @MessagePattern({ cmd: 'cart_add' })
  async addToCart(@Payload() data: { userId: string; item: AddToCartDto }) {
    try {
      const result = await this.cartService.addToCart(data.userId, data.item);
      return result;
    } catch (error) {
      throw errorResponse(error, 'Failed to add to cart', 400, true);
    }
  }

    @MessagePattern({ cmd: 'cart_get' })
    async getCart(@Payload() userId: string) {
        try {
            const result = await this.cartService.getCartByUser(userId);
            return result;
        } catch (error) {
            throw errorResponse(error, 'Failed to fetch cart', 404, true);
        }
    }

  



    @MessagePattern({ cmd: 'cart_remove' })
    async removeCartItem(@Payload() data: { userId: string; item: RemoveCartItemDto }) {
        try {
            const result = await this.cartService.removeCartItem(data.userId, data.item);
            return result;
        } catch (error) {
            throw errorResponse(error, 'Failed to remove item from cart', 400, true);
        }
    }

    @MessagePattern({ cmd: 'cart_clear' })
    async clearCart(@Payload() userId: string) {
        try {
            const result = await this.cartService.clearCart(userId);
            return result;
        } catch (error) {
            throw errorResponse(error, 'Failed to clear cart', 400, true);
        }
    }
}
