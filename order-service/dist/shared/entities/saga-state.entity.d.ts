export declare enum SagaStatus {
    STARTED = "STARTED",
    ORDER_CREATED = "ORDER_CREATED",
    PAYMENT_PROCESSING = "PAYMENT_PROCESSING",
    PAYMENT_VERIFIED = "PAYMENT_VERIFIED",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    COMPENSATING = "COMPENSATING",
    COMPENSATED = "COMPENSATED"
}
export declare class SagaState {
    id: number;
    saga_id: string;
    correlation_id: string;
    status: SagaStatus;
    saga_type: string;
    payload: any;
    compensation_data: any;
    error_message: string;
    retry_count: number;
    max_retries: number;
    expires_at: Date;
    razorpay_order_id: string;
    created_at: Date;
    updated_at: Date;
}
