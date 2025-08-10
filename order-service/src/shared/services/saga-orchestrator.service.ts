// shared/services/saga-orchestrator.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { SagaState, SagaStatus } from '../entities/saga-state.entity';
import { SagaEventType } from '../types/saga-events';
import { v4 as uuidv4 } from 'uuid';
import { SagaLogger } from '../utils/saga-logger.util';

@Injectable()
export class SagaOrchestratorService {
  private readonly logger = new Logger(SagaOrchestratorService.name);
  private readonly sagaLogger = SagaLogger.getInstance();

  constructor(
    @InjectRepository(SagaState)
    private readonly sagaRepository: Repository<SagaState>,
    @Inject('KAFKA_SERVICE') 
    private readonly kafkaClient: ClientKafka,
  ) {}

  async startOrderPaymentSaga(payload: any): Promise<string> {
    const sagaId = uuidv4();
    const correlationId = uuidv4();

    const saga = this.sagaRepository.create({
      saga_id: sagaId,
      correlation_id: correlationId,
      status: SagaStatus.STARTED,
      saga_type: 'ORDER_PAYMENT_SAGA',
      payload,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await this.sagaRepository.save(saga);

    // Start the saga by creating order
    await this.emitEvent('order-creation-started', {
      sagaId,
      timestamp: Date.now(),
      correlationId,
      version: 1,
      type: 'ORDER_CREATION_STARTED',
      payload,
    });

    this.sagaLogger.logSagaStart(sagaId, 'ORDER_PAYMENT_SAGA', payload);
    this.logger.log(`Started Order Payment Saga: ${sagaId}`);
    return sagaId;
  }

  async updateSagaStatus(
    sagaId: string, 
    status: SagaStatus, 
    payload?: any, 
    error?: string
  ): Promise<void> {
    try {
      const saga = await this.sagaRepository.findOne({
        where: { saga_id: sagaId },
      });

      if (!saga) {
        this.logger.error(`Saga not found: ${sagaId}`);
        return;
      }

      saga.status = status;
      if (payload) {
        saga.payload = { ...saga.payload, ...payload };
      }
      if (error) {
        saga.error_message = error;
      }
      if (payload?.razorpayOrderId) {
        saga.razorpay_order_id = payload.razorpayOrderId;
      }

      await this.sagaRepository.save(saga);
      this.sagaLogger.logSagaStep(sagaId, status, 'success', payload);
      this.logger.log(`Saga ${sagaId} status updated to ${status}`);
    } catch (err) {
      this.sagaLogger.logSagaError(sagaId, err);
      this.logger.error(`Failed to update saga ${sagaId}:`, err);
    }
  }

  async getSagaState(sagaId: string): Promise<SagaState | null> {
    return await this.sagaRepository.findOne({
      where: { saga_id: sagaId },
    });
  }

  async findSagaByRazorpayOrderId(razorpayOrderId: string): Promise<SagaState | null> {
    return await this.sagaRepository.findOne({
      where: { razorpay_order_id: razorpayOrderId },
    });
  }

  async handleSagaTimeout(): Promise<void> {
    const expiredSagas = await this.sagaRepository
      .createQueryBuilder('saga')
      .where('saga.expires_at < :now', { now: new Date() })
      .andWhere('saga.status NOT IN (:...completedStatuses)', {
        completedStatuses: [
          SagaStatus.COMPLETED,
          SagaStatus.COMPENSATED,
        ],
      })
      .getMany();

    for (const saga of expiredSagas) {
      this.logger.warn(`Saga timeout detected: ${saga.saga_id}`);
      await this.compensateSaga(saga.saga_id, 'Saga timeout');
    }
  }

  async compensateSaga(sagaId: string, reason: string): Promise<void> {
    const saga = await this.getSagaState(sagaId);
    if (!saga) return;

    await this.updateSagaStatus(sagaId, SagaStatus.COMPENSATING, null, reason);

    // Emit compensation events based on current saga state
    switch (saga.status) {
      case SagaStatus.PAYMENT_VERIFIED:
        // Need to reverse payment and cancel order
        await this.emitEvent('payment-reversal-requested', {
          sagaId,
          timestamp: Date.now(),
          correlationId: saga.correlation_id,
          version: 1,
          type: 'PAYMENT_REVERSAL_REQUESTED',
          payload: {
            razorpayPaymentId: saga.payload.razorpayPaymentId,
            razorpayOrderId: saga.payload.razorpayOrderId,
            amount: saga.payload.amount,
            reason,
          },
        });
        break;

      case SagaStatus.ORDER_CREATED:
        // Cancel the order
        await this.emitEvent('order-cancellation-requested', {
          sagaId,
          timestamp: Date.now(),
          correlationId: saga.correlation_id,
          version: 1,
          type: 'ORDER_CANCELLATION_REQUESTED',
          payload: {
            razorpayOrderId: saga.payload.razorpayOrderId,
            reason,
          },
        });
        break;
    }

    this.sagaLogger.logSagaCompensation(sagaId, saga.status, reason);
  }

  async retrySaga(sagaId: string): Promise<boolean> {
    const saga = await this.getSagaState(sagaId);
    if (!saga) return false;

    if (saga.retry_count >= saga.max_retries) {
      await this.compensateSaga(sagaId, 'Max retries exceeded');
      return false;
    }

    saga.retry_count++;
    await this.sagaRepository.save(saga);

    // Retry logic based on current status
    // This would emit appropriate retry events
    return true;
  }

  private async emitEvent(topic: string, event: SagaEventType): Promise<void> {
    try {
      await this.kafkaClient.emit(topic, event).toPromise();
      this.logger.log(`Event emitted: ${topic}`, { sagaId: event.sagaId });
    } catch (error) {
      this.sagaLogger.logSagaError(event.sagaId, error);
      this.logger.error(`Failed to emit event ${topic}:`, error);
      throw error;
    }
  }
}