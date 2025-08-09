export declare enum SagaStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    COMPENSATING = "compensating",
    COMPENSATED = "compensated",
    FAILED = "failed"
}
export declare enum SagaStepStatus {
    PENDING = "pending",
    EXECUTING = "executing",
    COMPLETED = "completed",
    FAILED = "failed",
    COMPENSATING = "compensating",
    COMPENSATED = "compensated"
}
export declare enum SagaStepType {
    INVENTORY_RESERVE = "inventory_reserve",
    ORDER_CREATE = "order_create",
    PAYMENT_PROCESS = "payment_process",
    INVENTORY_CONFIRM = "inventory_confirm",
    ORDER_CONFIRM = "order_confirm",
    NOTIFICATION_SEND = "notification_send"
}
export declare class Saga {
    id: number;
    saga_id: string;
    status: SagaStatus;
    payload: any;
    context: any;
    user_id: number;
    razorpay_order_id?: string;
    payment_id?: string;
    error_message?: string;
    created_at: Date;
    updated_at: Date;
    steps: SagaStep[];
}
export declare class SagaStep {
    id: number;
    saga_id: string;
    step_type: SagaStepType;
    status: SagaStepStatus;
    step_order: number;
    input_data: any;
    output_data: any;
    compensation_data: any;
    error_message?: string;
    retry_count: number;
    max_retries: number;
    created_at: Date;
    updated_at: Date;
    saga: Saga;
}
