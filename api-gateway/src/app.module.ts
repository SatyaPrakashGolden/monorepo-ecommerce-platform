import { Module } from '@nestjs/common';
import { BrandGatewayModule } from './modules/brand/brand.gateway.module';
import { CategoryGatewayModule } from './modules/category/category.gateway.module';
import { ProductGatewayModule } from './modules/product/product.gateway.module';
import { RatingGatewayModule } from './modules/rating/rating.gateway.module';

@Module({
  imports: [
    BrandGatewayModule,
    CategoryGatewayModule,
    ProductGatewayModule,
    RatingGatewayModule
  ],
})
export class AppModule {}