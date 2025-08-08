import { CreateOrderDto } from './dto/create-order.dto';
import { ClientKafka } from '@nestjs/microservices';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
export declare class PaymentService {
    private readonly kafkaClient;
    private readonly paymentRepository;
    private readonly razorpay;
    private readonly logger;
    constructor(kafkaClient: ClientKafka, paymentRepository: Repository<Payment>);
    createOrder(createOrderDto: CreateOrderDto): Promise<{
        id: any;
        amount: number;
        currency: any;
        receipt: any;
        status: any;
    }>;
    handleRazorpayCallback(payload: PaymentCallbackDto): Promise<{
        success: boolean;
        message: string;
        payment_id: any;
        order_id: string;
        error_description: any;
        status: any;
    } | {
        success: boolean;
        message: string;
        payment_id: any;
        order_id: string;
        error_description?: undefined;
        status?: undefined;
    }>;
}
