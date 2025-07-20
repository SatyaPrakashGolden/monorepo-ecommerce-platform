import { Module } from '@nestjs/common';
import { BrandGatewayModule } from './modules/brand/brand.gateway.module';
import { CategoryGatewayModule } from './modules/category/category.gateway.module';
import { ProductGatewayModule } from './modules/product/product.gateway.module';
import { RatingGatewayModule } from './modules/rating/rating.gateway.module';
import { OfferGatewayModule } from './modules/offer/offer.gateway.module';
@Module({
  imports: [
    BrandGatewayModule,
    CategoryGatewayModule,
    ProductGatewayModule,
    RatingGatewayModule,
    OfferGatewayModule 
  ],
})
export class AppModule {}