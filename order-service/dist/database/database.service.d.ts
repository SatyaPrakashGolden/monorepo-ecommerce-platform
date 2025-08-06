import { Repository } from 'typeorm';
import { Order } from '../modules/order/entities/order.entity';
export declare class DatabaseService {
    private readonly orderRepository;
    constructor(orderRepository: Repository<Order>);
    getAllOrders(): Promise<Order[]>;
}
