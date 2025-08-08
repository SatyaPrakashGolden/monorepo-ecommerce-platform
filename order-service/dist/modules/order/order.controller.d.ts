import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
export declare class OrderController {
    private readonly orderService;
    private readonly logger;
    constructor(orderService: OrderService);
    createOrder(createOrderDto: CreateOrderDto): Promise<Order>;
    handlePaymentOrderCreated(data: any): Promise<void>;
    handlePaymentVerified(data: any): Promise<void>;
    handlePaymentFailed(data: any): Promise<void>;
}
