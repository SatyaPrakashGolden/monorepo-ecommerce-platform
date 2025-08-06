import { OrderStatus } from '../entities/order.entity';
export declare class CreateOrderDto {
    userId: number;
    sellerId: string;
    variantId: string;
    amount: number;
    currency: string;
    status?: OrderStatus;
    name: string;
    price: number;
    image: string;
    size: string;
    color: string;
    quantity: number;
}
