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
  Param
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

      const result = await this.cartGatewayService.addToCart(userId, dto);
      return successResponse(result, 'Item added to cart');
    } catch (error) {
      console.log(error)
      throw throwHttpFormattedError(error, 'Failed to add item to cart');
    }
  }



  @Put('update')
  async updateCartItem(@Req() req: Request, @Body() dto: any) {
    try {
      const userId = req['user'].id;
      const result = await this.cartGatewayService.updateCartItem(userId, dto);
      return result
      return successResponse(result, 'Item updated in cart');
    } catch (error) {
      throw throwHttpFormattedError(error, 'Failed to update item in cart');
    }
  }


  @Get('get-all')
  async getCart(@Req() req: Request) {
    try {
      const userId = req['user'].id;
      const result = await this.cartGatewayService.getCart(userId);
      return result

    } catch (error) {
      throw throwHttpFormattedError(error, 'Failed to fetch cart');
    }
  }


  @Delete('clear')
async clearCart(@Req() req: Request) {
  try {
    const userId = req['user'].id;
    const result = await this.cartGatewayService.clearCart(userId);
    return successResponse(result, 'Cart cleared successfully');
  } catch (error) {
    throw throwHttpFormattedError(error, 'Failed to clear cart');
  }
}

@Delete('remove/:productId')
async removeCartItem(@Req() req: Request, @Param('productId') productId: string) {
  try {
    const userId = req['user'].id;
    const result = await this.cartGatewayService.removeCartItem(userId, productId);
    return successResponse(result, 'Item removed from cart');
  } catch (error) {
    throw throwHttpFormattedError(error, 'Failed to remove item from cart');
  }
}



}
