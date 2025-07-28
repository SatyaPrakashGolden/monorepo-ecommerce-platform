import { Module } from '@nestjs/common';
import { BrandGatewayModule } from './modules/brand/brand.gateway.module';
import { CategoryGatewayModule } from './modules/category/category.gateway.module';
import { ProductGatewayModule } from './modules/product/product.gateway.module';
import { RatingGatewayModule } from './modules/rating/rating.gateway.module';
import { OfferGatewayModule } from './modules/offer/offer.gateway.module';
import { UserGatewayModule } from './modules/user/user.gateway.module'
import { WishlistGatewayModule } from './modules/wishlist/wishlist.gateway.module'
import { CartGatewayModule } from './modules/cart/cart.gateway.module'

@Module({
  imports: [
    BrandGatewayModule,
    CategoryGatewayModule,
    ProductGatewayModule,
    RatingGatewayModule,
    OfferGatewayModule,
    UserGatewayModule,
    WishlistGatewayModule,
    CartGatewayModule
  ],
})
export class AppModule { }