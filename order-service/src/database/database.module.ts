import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';



import {Order}  from '../modules/order/entities/order.entity'

import { DatabaseService } from './database.service';
import { InventoryRepository } from './repositories/inventory.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order
    ]),
  ],
  providers: [DatabaseService, InventoryRepository],
  exports: [DatabaseService, InventoryRepository],
})
export class DatabaseModule {}
