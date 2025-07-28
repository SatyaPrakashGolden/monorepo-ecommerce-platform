import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WishlistService } from './wishlist.service';
import { errorResponse ,} from '../../utils/error.util';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}



  @MessagePattern({ cmd: 'wishlist_add' })
  async addToWishlist(@Payload() data: { userId: number; productId: string }) {
    try {
      const { userId, productId } = data;
      const result = await this.wishlistService.addToWishlist(userId, productId);
      return result;
    } catch (error) {
      
      throw errorResponse(error, 'Failed to add to wishlist', 400, true);
    }
  }


  @MessagePattern({ cmd: 'wishlist_remove' })
  async removeFromWishlist(@Payload() data: { userId: number; productId: string }) {
    try {
      const result = await this.wishlistService.removeFromWishlist(data.userId, data.productId);
      return result;
    } catch (error) {
      throw errorResponse(error, 'Failed to remove from wishlist', 400, true);
    }
  }


  @MessagePattern({ cmd: 'wishlist_get' })
  async getUserWishlist(@Payload() userId: number) {
    try {
      const result = await this.wishlistService.getUserWishlist(userId);
      return result;
    } catch (error) {
      throw errorResponse(error, 'Failed to fetch wishlist', 404, true);
    }
  }


  @MessagePattern({ cmd: 'wishlist_clear' })
  async clearWishlist(@Payload() userId: number) {
    try {
      const result = await this.wishlistService.clearWishlist(userId);
      return result;
    } catch (error) {
      throw errorResponse(error, 'Failed to clear wishlist', 400, true);
    }
  }
}
