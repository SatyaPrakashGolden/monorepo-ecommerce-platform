import { ClientKafka } from '@nestjs/microservices';
export declare class NotificationService {
    private kafkaClient;
    private readonly logger;
    constructor(kafkaClient: ClientKafka);
    sendPaymentSuccessNotification(data: {
        user_id: number;
        order_id: number;
        payment_id: string;
        amount: number;
    }): Promise<void>;
}
