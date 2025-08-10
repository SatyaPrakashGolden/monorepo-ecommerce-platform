// /home/satya/ecommercebackend/ecommerceBackend/order-service/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {OrderModule}  from './modules/order/order.module'
import { KafkaModule } from './kafka/kafka.module'; 
import { typeOrmConfig } from './config/database.config'; 
import{SharedModule} from './shared/shared.module'; 
@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    OrderModule, 
    KafkaModule,
    SharedModule
  ],
})
export class AppModule {}