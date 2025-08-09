import { PaymentSagaOrchestrator } from './payment-saga-orchestrator.service';
import { PaymentService } from './payment.service';
export declare class SagaEventController {
    private readonly sagaOrchestrator;
    private readonly paymentService;
    private readonly logger;
    constructor(sagaOrchestrator: PaymentSagaOrchestrator, paymentService: PaymentService);
    handleInventoryReserved(data: any): Promise<void>;
    handleOrderCreated(data: any): Promise<void>;
    handlePaymentProcess(data: any): Promise<void>;
    handlePaymentSuccess(data: any): Promise<void>;
    handlePaymentFailure(data: any): Promise<void>;
    handleInventoryConfirmed(data: any): Promise<void>;
    handleOrderConfirmed(data: any): Promise<void>;
    handleNotificationSent(data: any): Promise<void>;
}
