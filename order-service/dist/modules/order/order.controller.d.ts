import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
export declare class OrderController {
    private readonly orderService;
    private readonly logger;
    constructor(orderService: OrderService);
    createOrder(createOrderDto: CreateOrderDto): Promise<Order>;
    handleOrderCreationStarted(data: any): Promise<void>;
    handleOrderCreated(data: any): Promise<void>;
    handlePaymentProcessingStarted(data: any): Promise<void>;
    handlePaymentVerified(data: any): Promise<void>;
    handlePaymentFailed(data: any): Promise<void>;
    handleOrderCancellationRequest(data: any): Promise<void>;
    handlePaymentReversalRequest(data: any): Promise<void>;
    handlePaymentReversed(data: any): Promise<void>;
}
