// src/modules/payment/payment.service.ts

import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../database/repositories/payment.repository';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async getAllPayments() {
    return this.paymentRepo.find();
  }
}
