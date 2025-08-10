// /home/satya/ecommerce/order-service/src/modules/order/order.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaModule } from '../../kafka/kafka.module';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { DatabaseModule } from '../../database/database.module'; 
import {SagaOrchestratorService} from '../../shared/services/saga-orchestrator.service';
import { SagaState } from '../../shared/entities/saga-state.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Order,SagaState]), 
    DatabaseModule,
    KafkaModule
  ],
  providers: [OrderService, SagaOrchestratorService], // ✅ Add it here
  controllers: [OrderController],
  exports: [OrderService], 
})
export class OrderModule {}
