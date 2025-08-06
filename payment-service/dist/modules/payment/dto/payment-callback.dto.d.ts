export declare class PaymentCallbackDto {
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    isFailedPayment?: boolean;
    error?: {
        metadata?: string;
    };
}
