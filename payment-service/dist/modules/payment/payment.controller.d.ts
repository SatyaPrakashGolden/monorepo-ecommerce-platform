import { Response } from 'express';
import { PaymentService } from './payment.service';
import { PaymentSagaOrchestrator } from './payment-saga-orchestrator.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
export declare class PaymentController {
    private readonly paymentService;
    private readonly sagaOrchestrator;
    private readonly logger;
    constructor(paymentService: PaymentService, sagaOrchestrator: PaymentSagaOrchestrator);
    createOrder(req: any, createOrderDto: CreateOrderDto): Promise<{
        success: boolean;
        saga_id: string;
        message: string;
        order: {
            id: any;
            amount: number;
            currency: any;
            receipt: any;
            status: any;
        };
    }>;
    paymentCallback(body: PaymentCallbackDto, res: Response): Promise<void>;
}
