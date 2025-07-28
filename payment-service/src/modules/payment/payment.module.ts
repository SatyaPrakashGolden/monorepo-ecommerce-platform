// /home/satya/carbike360evBackend/ecommerceBackend/payment-service/src/modules/payment/payment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { KafkaModule } from '../../kafka/kafka.module';
import { Payment } from './entities/payment.entity'; 


@Module({
  imports: [
    TypeOrmModule.forFeature([Payment ]), // ✅ Corrected
    KafkaModule, // ✅ Assuming this provides 'KAFKA_SERVICE'
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
