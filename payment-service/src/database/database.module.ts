// src/database/database.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../modules/payment/entities/payment.entity';
import { PaymentRepository } from './repositories/payment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  providers: [PaymentRepository],
  exports: [PaymentRepository],
})
export class DatabaseModule {}
