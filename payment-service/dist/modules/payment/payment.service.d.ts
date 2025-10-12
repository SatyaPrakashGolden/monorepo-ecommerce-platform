import { CreateOrderDto } from './dto/create-order.dto';
import { ClientKafka } from '@nestjs/microservices';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { SagaOrchestratorService } from '../../shared/services/saga-orchestrator.service';
export declare class PaymentService {
    private readonly kafkaClient;
    private readonly paymentRepository;
    private readonly sagaOrchestrator;
    private readonly razorpay;
    private readonly logger;
    private readonly sagaLogger;
    constructor(kafkaClient: ClientKafka, paymentRepository: Repository<Payment>, sagaOrchestrator: SagaOrchestratorService);
    createOrder(createOrderDto: CreateOrderDto): Promise<{
        id: any;
        amount: number;
        currency: any;
        receipt: any;
        status: any;
        sagaId: string;
    }>;
    handleRazorpayCallback(payload: PaymentCallbackDto): Promise<{
        success: boolean;
        message: string;
        payment_id: any;
        order_id: string;
        sagaId: string;
    } | {
        success: boolean;
        message: string;
        payment_id: string;
        order_id: string;
    }>;
    private handleFailedPayment;
    private handleSuccessfulPayment;
    handlePaymentReversalRequest(event: any): Promise<void>;
}
