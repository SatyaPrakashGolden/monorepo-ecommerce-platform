export declare enum OrderStatus {
    PENDING = "pending",
    SUCCESS = "success"
}
export declare class Order {
    id: number;
    user_id: number;
    product_id: string;
    total_amount: string;
    currency: string;
    status: OrderStatus;
    razorpay_order_id: string;
    receipt: string;
    razorpay_created_at: number;
    name: string;
    price: number;
    image: string;
    size: string;
    color: string;
    quantity: number;
    created_at: Date;
    updated_at: Date;
}
