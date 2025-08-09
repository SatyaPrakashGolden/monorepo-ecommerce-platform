export declare class CreateOrderDto {
    user_id?: number;
    product_id: string;
    total_amount: number;
    currency?: string;
    checkout_data?: {
        cartItems: Array<{
            productId: string;
            name: string;
            price: number;
            image: string;
            size: string;
            color: string;
            quantity: number;
        }>;
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
    };
    saga_id?: string;
    status?: string;
}
