import { Response } from 'express';
import { PaymentService } from './payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
export declare class PaymentController {
    private readonly paymentService;
    private readonly logger;
    constructor(paymentService: PaymentService);
    createOrder(req: any, createOrderDto: CreateOrderDto): Promise<{
        success: boolean;
        order: {
            id: any;
            amount: number;
            currency: any;
            receipt: any;
            status: any;
            sagaId: string;
        };
    }>;
    paymentCallback(body: PaymentCallbackDto, res: Response): Promise<void>;
    handleOrderCreationStarted(data: any): Promise<void>;
    handleOrderCreated(data: any): Promise<void>;
    handlePaymentReversalRequest(data: any): Promise<void>;
    handleOrderCompleted(data: any): Promise<void>;
    handleOrderFailed(data: any): Promise<void>;
}
