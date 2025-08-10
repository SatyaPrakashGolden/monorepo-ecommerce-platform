import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { ClientKafka } from '@nestjs/microservices';
import { SagaOrchestratorService } from '../../shared/services/saga-orchestrator.service';
export declare class OrderService {
    private readonly orderRepository;
    private readonly kafkaClient;
    private readonly sagaOrchestrator;
    private readonly logger;
    private readonly sagaLogger;
    constructor(orderRepository: Repository<Order>, kafkaClient: ClientKafka, sagaOrchestrator: SagaOrchestratorService);
    createOrder(createOrderDto: CreateOrderDto): Promise<Order>;
    findOrderByRazorpayId(razorpayOrderId: string): Promise<Order | null>;
    findOrdersByUserId(userId: number): Promise<Order[]>;
    markOrderAsPaid(sagaId: string, razorpayOrderId: string, paymentId: number): Promise<Order>;
    markOrderAsFailed(sagaId: string, razorpayOrderId: string, reason?: string): Promise<Order>;
    markOrderAsCancelled(sagaId: string, razorpayOrderId: string, reason?: string): Promise<Order>;
    handleOrderCreated(event: any): Promise<void>;
    handlePaymentVerified(event: any): Promise<void>;
    handlePaymentFailed(event: any): Promise<void>;
    handleOrderCancellationRequest(event: any): Promise<void>;
}
