import { CreateOrderDto } from './dto/create-order.dto';
import { ClientKafka } from '@nestjs/microservices';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
export declare class PaymentService {
    private readonly kafkaClient;
    private readonly paymentRepository;
    private readonly razorpay;
    private readonly logger;
    constructor(kafkaClient: ClientKafka, paymentRepository: Repository<Payment>);
    createOrder({ amount, currency, user_id, seller_id, variant_id }: CreateOrderDto): Promise<{
        id: any;
        amount: number;
        currency: any;
        receipt: any;
        status: any;
    }>;
    handleRazorpayCallback(payload: {
        razorpay_payment_id?: string;
        razorpay_order_id?: string;
        razorpay_signature?: string;
        isFailedPayment?: boolean;
    }): Promise<{
        success: boolean;
        message: string;
        payment_id: any;
        order_id: any;
        error_description: any;
        status: any;
    } | {
        success: boolean;
        message: string;
        payment_id: any;
        order_id: any;
        error_description?: undefined;
        status?: undefined;
    }>;
}
