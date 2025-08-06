import { DataSource } from 'typeorm';
import { Order } from '../../modules/order/entities/order.entity';
export declare class InventoryRepository {
    private readonly dataSource;
    private orderRepository;
    constructor(dataSource: DataSource);
    getAllOrders(): Promise<Order[]>;
}
