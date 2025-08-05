import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from '../order/order.module';
import { SagaOrchestrator } from './saga.orchestrator';
import { SagaTransaction, SagaStep } from './saga.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SagaTransaction, SagaStep]), OrderModule],
  providers: [SagaOrchestrator],
  exports: [SagaOrchestrator],
})
export class SagaModule {}