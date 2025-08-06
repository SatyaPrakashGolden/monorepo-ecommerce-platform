import { DataSource, Repository } from 'typeorm';
import { Payment } from '../../modules/payment/entities/payment.entity';
export declare class PaymentRepository extends Repository<Payment> {
    private readonly dataSource;
    constructor(dataSource: DataSource);
}
