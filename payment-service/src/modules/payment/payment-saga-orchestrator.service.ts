import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Saga, SagaStep, SagaStatus, SagaStepStatus, SagaStepType } from './entities/saga.entity';

@Injectable()
export class PaymentSagaOrchestrator {
  private readonly logger = new Logger(PaymentSagaOrchestrator.name);

  constructor(
    @InjectRepository(Saga) private sagaRepository: Repository<Saga>,
    @InjectRepository(SagaStep) private sagaStepRepository: Repository<SagaStep>,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async startPaymentSaga(payload: {
    user_id: number;
    cart_items: any[];
    total_amount: number;
    currency: string;
  }): Promise<string> {
    const sagaId = `saga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const saga = this.sagaRepository.create({
        saga_id: sagaId,
        status: SagaStatus.IN_PROGRESS,
        payload,
        context: {},
        user_id: payload.user_id,
      });
      await this.sagaRepository.save(saga);

      const steps = [
        { type: SagaStepType.INVENTORY_RESERVE, order: 1 },
        { type: SagaStepType.ORDER_CREATE, order: 2 },
        { type: SagaStepType.PAYMENT_PROCESS, order: 3 },
        { type: SagaStepType.INVENTORY_CONFIRM, order: 4 },
        { type: SagaStepType.ORDER_CONFIRM, order: 5 },
        { type: SagaStepType.NOTIFICATION_SEND, order: 6 },
      ];

      for (const stepDef of steps) {
        const step = this.sagaStepRepository.create({
          saga_id: sagaId,
          step_type: stepDef.type,
          step_order: stepDef.order,
          status: SagaStepStatus.PENDING,
          input_data: payload,
        });
        await this.sagaStepRepository.save(step);
      }

      await this.executeNextStep(sagaId);
      this.logger.log(`Payment saga started: ${sagaId}`);
      return sagaId;
    } catch (error) {
      this.logger.error(`Failed to start payment saga: ${error.message}`);
      await this.markSagaAsFailed(sagaId, error.message);
      throw error;
    }
  }

  async executeNextStep(sagaId: string): Promise<void> {
    const saga = await this.getSagaWithSteps(sagaId);
    if (!saga) return;

    const nextStep = saga.steps
      .filter(step => step.status === SagaStepStatus.PENDING)
      .sort((a, b) => a.step_order - b.step_order)[0];

    if (!nextStep) {
      await this.completeSaga(sagaId);
      return;
    }

    try {
      await this.executeStep(nextStep);
    } catch (error) {
      this.logger.error(`Step execution failed: ${error.message}`);
      await this.handleStepFailure(nextStep, error.message);
    }
  }

private async executeStep(step: SagaStep): Promise<void> {
  this.logger.log(`Executing step: ${step.step_type} for saga: ${step.saga_id}`);
  step.status = SagaStepStatus.EXECUTING;
  await this.sagaStepRepository.save(step);

  const saga = await this.getSagaWithSteps(step.saga_id);
  if (!saga) {
    this.logger.error(`Saga not found for step: ${step.saga_id}`);
    throw new Error(`Saga not found: ${step.saga_id}`);
  }

  const eventData = {
    saga_id: step.saga_id,
    step_id: step.id,
    payload: saga.payload,
    context: saga.context,
  };

  switch (step.step_type) {
    case SagaStepType.INVENTORY_RESERVE:
      await this.kafkaClient.emit('saga.inventory.reserve', eventData);
      break;
    case SagaStepType.ORDER_CREATE:
      await this.kafkaClient.emit('saga.order.create', eventData);
      break;
    case SagaStepType.PAYMENT_PROCESS:
      // Check if Razorpay order already exists in context
      if (saga.context?.razorpay_order) {
        // Razorpay order already created, just mark step as successful
        await this.handleStepSuccess(step.id, {
          razorpay_order_id: saga.context.razorpay_order.id,
          razorpay_amount: saga.context.razorpay_order.amount,
          razorpay_status: saga.context.razorpay_order.status,
          razorpay_receipt: saga.context.razorpay_order.receipt,
          payment_ready: true
        });
      } else {
        // Fallback: emit event to create order (original flow)
        await this.kafkaClient.emit('saga.payment.process', eventData);
      }
      break;
    case SagaStepType.INVENTORY_CONFIRM:
      await this.kafkaClient.emit('saga.inventory.confirm', eventData);
      break;
    case SagaStepType.ORDER_CONFIRM:
      await this.kafkaClient.emit('saga.order.confirm', eventData);
      break;
    case SagaStepType.NOTIFICATION_SEND:
      await this.kafkaClient.emit('saga.notification.send', eventData);
      break;
  }
}

  async handleStepSuccess(stepId: number, outputData?: any): Promise<void> {
    const step = await this.sagaStepRepository.findOne({ where: { id: stepId } });
    if (!step) return;

    step.status = SagaStepStatus.COMPLETED;
    step.output_data = outputData;
    await this.sagaStepRepository.save(step);

    if (outputData) {
      const saga = await this.sagaRepository.findOne({ where: { saga_id: step.saga_id } });
      if (saga) {
        saga.context = { ...saga.context, [step.step_type]: outputData };
        await this.sagaRepository.save(saga);
      }
    }

    this.logger.log(`Step completed: ${step.step_type} for saga: ${step.saga_id}`);
    await this.executeNextStep(step.saga_id);
  }

  async handleStepFailure(step: SagaStep, errorMessage: string): Promise<void> {
    if (step.retry_count < step.max_retries) {
      step.retry_count++;
      step.status = SagaStepStatus.PENDING;
      step.error_message = errorMessage;
      await this.sagaStepRepository.save(step);
      this.logger.log(`Retrying step: ${step.step_type} (${step.retry_count}/${step.max_retries})`);
      setTimeout(() => this.executeStep(step), 5000 * step.retry_count);
    } else {
      step.status = SagaStepStatus.FAILED;
      step.error_message = errorMessage;
      await this.sagaStepRepository.save(step);
      await this.startCompensation(step.saga_id);
    }
  }

  async startCompensation(sagaId: string): Promise<void> {
    this.logger.log(`Starting compensation for saga: ${sagaId}`);
    const saga = await this.getSagaWithSteps(sagaId);
    if (!saga) return;

    saga.status = SagaStatus.COMPENSATING;
    await this.sagaRepository.save(saga);

    const completedSteps = saga.steps
      .filter(step => step.status === SagaStepStatus.COMPLETED)
      .sort((a, b) => b.step_order - a.step_order);

    for (const step of completedSteps) {
      await this.compensateStep(step);
    }

    saga.status = SagaStatus.COMPENSATED;
    await this.sagaRepository.save(saga);
  }

  private async compensateStep(step: SagaStep): Promise<void> {
    this.logger.log(`Compensating step: ${step.step_type} for saga: ${step.saga_id}`);
    step.status = SagaStepStatus.COMPENSATING;
    await this.sagaStepRepository.save(step);

    const saga = await this.getSagaWithSteps(step.saga_id);
    if (!saga) {
      this.logger.error(`Saga not found for compensation: ${step.saga_id}`);
      throw new Error(`Saga not found: ${step.saga_id}`);
    }

    const eventData = {
      saga_id: step.saga_id,
      step_id: step.id,
      payload: saga.payload,
      context: saga.context,
      compensation_data: step.output_data,
    };

    try {
      switch (step.step_type) {
        case SagaStepType.INVENTORY_RESERVE:
          await this.kafkaClient.emit('saga.inventory.release', eventData);
          break;
        case SagaStepType.ORDER_CREATE:
          await this.kafkaClient.emit('saga.order.cancel', eventData);
          break;
        case SagaStepType.PAYMENT_PROCESS:
          await this.kafkaClient.emit('saga.payment.refund', eventData);
          break;
        case SagaStepType.INVENTORY_CONFIRM:
          await this.kafkaClient.emit('saga.inventory.release', eventData);
          break;
        case SagaStepType.ORDER_CONFIRM:
          await this.kafkaClient.emit('saga.order.cancel', eventData);
          break;
        case SagaStepType.NOTIFICATION_SEND:
          await this.kafkaClient.emit('saga.notification.cancel', eventData);
          break;
      }
      step.status = SagaStepStatus.COMPENSATED;
      await this.sagaStepRepository.save(step);
    } catch (error) {
      this.logger.error(`Compensation failed for step ${step.step_type}: ${error.message}`);
      step.error_message = `Compensation failed: ${error.message}`;
      await this.sagaStepRepository.save(step);
    }
  }

  private async completeSaga(sagaId: string): Promise<void> {
    const saga = await this.sagaRepository.findOne({ where: { saga_id: sagaId } });
    if (!saga) return;

    saga.status = SagaStatus.COMPLETED;
    await this.sagaRepository.save(saga);
    this.logger.log(`Saga completed successfully: ${sagaId}`);
    await this.kafkaClient.emit('saga.payment.completed', {
      saga_id: sagaId,
      user_id: saga.user_id,
      payment_id: saga.payment_id,
      razorpay_order_id: saga.razorpay_order_id,
    });
  }

  private async markSagaAsFailed(sagaId: string, errorMessage: string): Promise<void> {
    const saga = await this.sagaRepository.findOne({ where: { saga_id: sagaId } });
    if (!saga) return;

    saga.status = SagaStatus.FAILED;
    saga.error_message = errorMessage;
    await this.sagaRepository.save(saga);
  }

  private async getSagaWithSteps(sagaId: string): Promise<Saga | null> {
    return this.sagaRepository.findOne({
      where: { saga_id: sagaId },
      relations: ['steps'],
    });
  }
}