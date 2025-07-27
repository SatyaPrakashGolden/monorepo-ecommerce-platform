import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { WishlistGatewayService } from './wishlist.gateway.service';
import { successResponse, throwHttpFormattedError } from '../../utils/error.util';
import { AuthGuard } from '../../auth/auth.middleware'; 

@Controller('wishlist')
@UseGuards(AuthGuard) 
export class WishlistController {
  constructor(
    private readonly wishlistGatewayService: WishlistGatewayService,
  ) {}

  /**
   * Add a product to wishlist
   * POST /wishlist/add
   */
  @Post('add')
  async addToWishlist(
    @Req() req: Request,
    @Body('productId') productId: string,
  ) {
    try {
      const userId = req['user'].id;
      const result = await this.wishlistGatewayService.addWishlist({ userId, productId });
      return successResponse(result, 'Product added to wishlist');
    } catch (error) {
      throw throwHttpFormattedError(error, 'Failed to add to wishlist');
    }
  }

  /**
   * Remove a product from wishlist
   * POST /wishlist/remove
   */
  @Post('remove')
  async removeFromWishlist(
    @Req() req: Request,
    @Body('productId') productId: string,
  ) {
    try {
      const userId = req['user'].id;
      const result = await this.wishlistGatewayService.removeWishlist({ userId, productId });
      return successResponse(result, 'Product removed from wishlist');
    } catch (error) {
      throw throwHttpFormattedError(error, 'Failed to remove from wishlist');
    }
  }

  /**
   * Get user wishlist
   * POST /wishlist/get
   */
  @Post('get')
  async getWishlist(@Req() req: Request) {
    try {
      const userId = req['user'].id;
      const result = await this.wishlistGatewayService.getWishlist(userId);
      return result;
    } catch (error) {
      throw throwHttpFormattedError(error, 'Failed to fetch wishlist');
    }
  }

  /**
   * Clear user's wishlist
   * POST /wishlist/clear
   */
  @Post('clear')
  async clearWishlist(@Req() req: Request) {
    try {
      const userId = req['user'].id;
      const result = await this.wishlistGatewayService.clearWishlist(userId);
      return successResponse(result, 'Wishlist cleared');
    } catch (error) {
      throw throwHttpFormattedError(error, 'Failed to clear wishlist');
    }
  }
  
}
