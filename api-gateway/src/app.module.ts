import { Module } from '@nestjs/common';
import { BrandGatewayModule } from './modules/brand/brand.gateway.module';
import { CategoryGatewayModule } from './modules/category/category.gateway.module'; // Import new module

@Module({
  imports: [BrandGatewayModule, CategoryGatewayModule], // Add it here
})
export class AppModule {}