import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Request,
  Put,
  Delete,
  Get,
} from '@nestjs/common';
import { CartGatewayService } from './cart.gateway.service';
import {
  successResponse,
  throwHttpFormattedError,
} from '../../utils/error.util';
import { AuthGuard } from '../../auth/auth.middleware';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartGatewayService: CartGatewayService) { }

  @Post('add')
  async addToCart(
    @Req() req: Request,
    @Body() dto: any
  ) {
    try {
      const userId = req['user'].id;
      console.log("________________________________>",userId)
      const result = await this.cartGatewayService.addToCart(userId, dto);
      return successResponse(result, 'Item added to cart');
    } catch (error) {
      console.log(error)
      throw throwHttpFormattedError(error, 'Failed to add item to cart');
    }
  }



  @Delete('remove')
  async removeCartItem(@Req() req: Request, @Body() dto: any) {
    try {
      const userId = req['user'].id;
      const result = await this.cartGatewayService.removeCartItem(userId, dto);
      return successResponse(result, 'Item removed from cart');
    } catch (error) {
      throw throwHttpFormattedError(error, 'Failed to remove item from cart');
    }
  }

  @Delete('clear')
  async clearCart(@Req() req: Request) {
    try {
      const userId = req['user'].id;
      const result = await this.cartGatewayService.clearCart(userId);
      return successResponse(result, 'Cart cleared');
    } catch (error) {
      throw throwHttpFormattedError(error, 'Failed to clear cart');
    }
  }

  @Get()
  async getCart(@Req() req: Request) {
    try {
      const userId = req['user'].id;
      const result = await this.cartGatewayService.getCart(userId);
      return successResponse(result, 'Cart fetched');
    } catch (error) {
      throw throwHttpFormattedError(error, 'Failed to fetch cart');
    }
  }

}
