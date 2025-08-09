export declare class PaymentCallbackDto {
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    error?: {
        metadata?: string;
        description?: string;
    };
    saga_id?: string;
    isFailedPayment?: boolean;
}
