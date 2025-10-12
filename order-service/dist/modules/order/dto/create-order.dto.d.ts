import { OrderStatus } from '../entities/order.entity';
export declare class CreateOrderDto {
    user_id: number;
    product_id: string;
    total_amount: number;
    currency?: string;
    status?: OrderStatus;
    razorpay_order_id?: string;
    receipt?: string;
    razorpay_created_at?: number;
}
