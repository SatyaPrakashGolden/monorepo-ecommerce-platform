import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class CartGatewayService {
  constructor(
    @Inject('CATALOG_SERVICE') private readonly CartClient: ClientProxy,
  ) { }

  async getCart(userId: number) {
    return await firstValueFrom(
      this.CartClient.send({ cmd: 'cart_get' }, userId),
    );
  }

  async addToCart(userId: number, item: any) {
    return await firstValueFrom(
      this.CartClient.send({ cmd: 'cart_add' }, { userId, item }),
    );
  }


  async updateCartItem(userId: number, item: any) {
    return await firstValueFrom(
      this.CartClient.send({ cmd: 'cart_update' }, { userId, item }),
    );
  }

  async clearCart(userId: number) {
    return await firstValueFrom(
      this.CartClient.send({ cmd: 'cart_clear' }, userId),
    );
  }

    async removeCartItem(userId: number, productId: string) {
    return await firstValueFrom(
      this.CartClient.send({ cmd: 'cart_remove' }, { userId, productId }),
    );
  }

}
