import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../../modules/order/entities/order.entity';

@Injectable()
export class InventoryRepository {
  private orderRepository: Repository<Order>;

  constructor(private readonly dataSource: DataSource) {
    // Initialize the repository with the DataSource
    this.orderRepository = this.dataSource.getRepository(Order);
  }

 
  // Get all orders
  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.find();
  }



 
}
