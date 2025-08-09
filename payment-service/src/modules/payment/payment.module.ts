import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

import { NotificationService } from '../../notification/notification.service';
import { PaymentSagaOrchestrator } from './payment-saga-orchestrator.service';
import { SagaEventController } from './saga-event.controller';
import { Payment } from './entities/payment.entity';
import { Order } from './entities/order.entity';
import { Saga, SagaStep } from './entities/saga.entity';
import { AuthModule } from '../../auth/auth.module'; // Only if needed

@Module({
  imports: [
    TypeOrmModule.forFeature([Saga, SagaStep, Payment, Order]),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'payment-saga-service',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'payment-saga-consumer-group',
          },
        },
      },
    ]),
    AuthModule, // Move here if required
  ],
  controllers: [PaymentController, SagaEventController],
  providers: [
    PaymentService,
    PaymentSagaOrchestrator,
    NotificationService,
  ],
  exports: [PaymentSagaOrchestrator],
})
export class PaymentSagaModule {}
