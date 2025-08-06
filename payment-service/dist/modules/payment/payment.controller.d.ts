import { Response } from 'express';
import { PaymentService } from './payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
export declare class PaymentController {
    private readonly paymentService;
    private readonly logger;
    constructor(paymentService: PaymentService);
    createOrder(createOrderDto: CreateOrderDto): Promise<{
        success: boolean;
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
