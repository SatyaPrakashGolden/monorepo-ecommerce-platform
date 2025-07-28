import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from '../modules/order/entities/order.entity';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>, // Inject the repository for the Order entity
  ) {}

  // Example method to get all orders
  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.find();
  }

}
