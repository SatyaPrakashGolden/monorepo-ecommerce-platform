import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WishlistGatewayService {
  constructor(
    @Inject('CATALOG_SERVICE') private readonly wishlistClient: ClientProxy,
  ) {}

  /**
   * Add product to wishlist
   */
  async addWishlist(data: { userId: number; productId: string }) {
    return await firstValueFrom(
      this.wishlistClient.send({ cmd: 'wishlist_add' }, data),
    );
  }

  /**
   * Remove product from wishlist
   */
  async removeWishlist(data: { userId: number; productId: string }) {
    return await firstValueFrom(
      this.wishlistClient.send({ cmd: 'wishlist_remove' }, data),
    );
  }

  /**
   * Get user's wishlist
   */
  async getWishlist(userId: number) {
    return await firstValueFrom(
      this.wishlistClient.send({ cmd: 'wishlist_get' }, userId),
    );
  }

  /**
   * Clear user's wishlist
   */
  async clearWishlist(userId: number) {
    return await firstValueFrom(
      this.wishlistClient.send({ cmd: 'wishlist_clear' }, userId),
    );
  }
}
