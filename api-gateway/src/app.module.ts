import { Module } from '@nestjs/common';
import { BrandGatewayModule } from './modules/brand/brand.gateway.module';

@Module({
  imports: [BrandGatewayModule],
})
export class AppModule {}
