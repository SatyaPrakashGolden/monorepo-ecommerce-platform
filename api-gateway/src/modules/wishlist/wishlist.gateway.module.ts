import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WishlistController } from './wishlist.gateway.controller';
import { WishlistGatewayService } from './wishlist.gateway.service';
import { AuthGuard } from '../../auth/auth.middleware';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30h' },
    }),
    ClientsModule.register([
      {
        name: 'CATALOG_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4001,
        },
      },
    ]),
  ],
  controllers: [WishlistController],
  providers: [WishlistGatewayService, AuthGuard],
})
export class WishlistGatewayModule {}
