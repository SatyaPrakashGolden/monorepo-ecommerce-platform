import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class CartGatewayService {
  constructor(
    @Inject('CATALOG_SERVICE') private readonly CartClient: ClientProxy,
  ) {}

  async getCart(userId: string) {
    return await firstValueFrom(
      this.CartClient.send({ cmd: 'cart_get' }, userId),
    );
  }

  async addToCart(userId: string, item: any) {
    return await firstValueFrom(
      this.CartClient.send({ cmd: 'cart_add' }, { userId, item }),
    );
  }


  async removeCartItem(userId: string, item: any) {
    return await firstValueFrom(
      this.CartClient.send({ cmd: 'cart_remove' }, { userId, item }),
    );
  }

  async clearCart(userId: string) {
    return await firstValueFrom(
      this.CartClient.send({ cmd: 'cart_clear' }, userId),
    );
  }
}
