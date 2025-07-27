import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './user.gateway.controller';
import { UserGatewayService } from './user.gateway.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4002,
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserGatewayService],
})
export class UserGatewayModule {}