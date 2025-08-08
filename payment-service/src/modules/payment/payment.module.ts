// /home/satya/myproject/payment-service/src/modules/payment/payment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { KafkaModule } from '../../kafka/kafka.module';
import { Payment } from './entities/payment.entity'; 
import {AuthModule} from '../../auth/auth.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment ]), 
    KafkaModule,
    AuthModule
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
})

export class PaymentModule {}