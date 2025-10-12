import { PaymentRepository } from '../database/repositories/payment.repository';
export declare class PaymentService {
    private readonly paymentRepo;
    constructor(paymentRepo: PaymentRepository);
    getAllPayments(): Promise<import("../modules/payment/entities/payment.entity").Payment[]>;
}
