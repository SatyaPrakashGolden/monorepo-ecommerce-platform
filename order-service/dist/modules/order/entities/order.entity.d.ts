export declare enum OrderStatus {
    PENDING = "pending",
    SUCCESS = "success",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare class Order {
    id: number;
    user_id: number;
    product_id?: string;
    total_amount: number;
    currency: string;
    status: OrderStatus;
    razorpay_order_id?: string;
    receipt?: string;
    razorpay_created_at?: number;
    payment_id?: number;
    created_at: Date;
    updated_at: Date;
}
