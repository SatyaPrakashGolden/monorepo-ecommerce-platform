import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { ClientKafka } from '@nestjs/microservices';
export declare class OrderService {
    private readonly orderRepository;
    private readonly kafkaClient;
    private readonly logger;
    constructor(orderRepository: Repository<Order>, kafkaClient: ClientKafka);
    createOrder(createOrderDto: CreateOrderDto): Promise<Order>;
    markOrderAsPaid(razorpayOrderId: string): Promise<void>;
}
