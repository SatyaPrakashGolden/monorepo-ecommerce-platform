import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka, EventPattern } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { OrderService } from '../order/order.service';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { SagaTransaction, SagaStep, SagaStatus, SagaStepStatus } from './saga.entity';

interface SagaStepDefinition {
  name: string;
  execute: (payload: any) => Promise<any>;
  compensate: (payload: any, stepData: any) => Promise<void>;
  timeout: number;
  retryCount?: number;
  isAsync?: boolean; // For steps that wait for external events
}

interface PendingAsyncStep {
  sagaId: string;
  sagaType: string;
  stepName: string;
  timeout: NodeJS.Timeout;
}

@Injectable()
export class SagaOrchestrator implements OnModuleInit {
  private readonly logger = new Logger(SagaOrchestrator.name);
  private readonly sagaSteps: Map<string, SagaStepDefinition[]> = new Map();
  private readonly pendingAsyncSteps: Map<string, PendingAsyncStep> = new Map();

  constructor(
    @InjectRepository(SagaTransaction)
    private readonly sagaRepository: Repository<SagaTransaction>,
    @InjectRepository(SagaStep)
    private readonly stepRepository: Repository<SagaStep>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
    private readonly orderService: OrderService,
  ) {
    this.initializePaymentSaga();
  }

  async onModuleInit() {
    // Subscribe to Kafka topics
    await this.kafkaClient.subscribeToResponseOf('payment.create.requested');
    await this.kafkaClient.subscribeToResponseOf('payment.process.requested');
    await this.kafkaClient.subscribeToResponseOf('payment.cancel.requested');
    
    // Resume any interrupted sagas on startup
    await this.resumeInterruptedSagas();
  }

  private initializePaymentSaga() {
    const paymentSagaSteps: SagaStepDefinition[] = [
      {
        name: 'VALIDATE_ORDER',
        execute: this.validateOrder.bind(this),
        compensate: this.cancelOrder.bind(this),
        timeout: 5000,
        retryCount: 3,
      },
      {
        name: 'CREATE_PAYMENT',
        execute: this.createPayment.bind(this),
        compensate: this.cancelPayment.bind(this),
        timeout: 30000,
        retryCount: 2,
        isAsync: true, // Waits for external event
      },
      {
        name: 'PROCESS_PAYMENT',
        execute: this.processPayment.bind(this),
        compensate: this.refundPayment.bind(this),
        timeout: 60000,
        retryCount: 1,
        isAsync: true, // Waits for external event
      },
      {
        name: 'UPDATE_ORDER_STATUS',
        execute: this.updateOrderStatus.bind(this),
        compensate: this.revertOrderStatus.bind(this),
        timeout: 5000,
        retryCount: 3,
      },
    ];
    this.sagaSteps.set('PAYMENT_SAGA', paymentSagaSteps);
  }

  async executeSaga(sagaType: string, payload: any): Promise<string> {
    return await this.sagaRepository.manager.transaction(async (manager) => {
      const sagaId = this.generateSagaId();
      const steps = this.sagaSteps.get(sagaType);

      if (!steps) {
        throw new Error(`Saga type ${sagaType} not found`);
      }

      const sagaTransaction = manager.create(SagaTransaction, {
        sagaId,
        status: SagaStatus.STARTED,
        payload,
        currentStep: 0,
        totalSteps: steps.length,
      });

      await manager.save(sagaTransaction);

      const sagaSteps = steps.map((step, index) =>
        manager.create(SagaStep, {
          sagaId,
          stepName: step.name,
          stepOrder: index,
          status: SagaStepStatus.PENDING,
          retryCount: 0,
          maxRetries: step.retryCount || 0,
        })
      );

      await manager.save(sagaSteps);

      // Start execution asynchronously
      setImmediate(() => this.executeNextStep(sagaId, sagaType));

      return sagaId;
    });
  }

  private async executeNextStep(sagaId: string, sagaType: string) {
    try {
      const saga = await this.sagaRepository.findOne({ where: { sagaId } });
      const steps = this.sagaSteps.get(sagaType);

      if (!saga || !steps || saga.status !== SagaStatus.STARTED) return;

      const currentStepIndex = saga.currentStep;
      if (currentStepIndex >= steps.length) {
        await this.completeSaga(sagaId);
        return;
      }

      const stepDefinition = steps[currentStepIndex];
      const stepRecord = await this.stepRepository.findOne({
        where: { sagaId, stepOrder: currentStepIndex },
      });

      if (!stepRecord || stepRecord.status === SagaStepStatus.COMPLETED) {
        // Move to next step if current is already completed
        saga.currentStep = currentStepIndex + 1;
        await this.sagaRepository.save(saga);
        return this.executeNextStep(sagaId, sagaType);
      }

      // Check if step is already running (idempotency)
      if (stepRecord.status === SagaStepStatus.RUNNING) {
        return;
      }

      this.logger.log(`Executing step ${stepDefinition.name} for saga ${sagaId}`);

      stepRecord.status = SagaStepStatus.RUNNING;
      await this.stepRepository.save(stepRecord);

      try {
        let stepResult: any;

        if (stepDefinition.isAsync) {
          // For async steps, execute and wait for external event
          stepResult = await stepDefinition.execute(saga.payload);
          
          // Set up timeout for async operation
          const timeoutId = setTimeout(() => {
            this.handleStepTimeout(sagaId, sagaType, stepDefinition.name);
          }, stepDefinition.timeout);

          this.pendingAsyncSteps.set(`${sagaId}_${stepDefinition.name}`, {
            sagaId,
            sagaType,
            stepName: stepDefinition.name,
            timeout: timeoutId,
          });

          // Don't proceed to next step yet - wait for external event
        } else {
          // For sync steps, execute with timeout
          stepResult = await Promise.race([
            stepDefinition.execute(saga.payload),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Step timeout')), stepDefinition.timeout)
            ),
          ]);

          await this.completeStep(sagaId, sagaType, stepDefinition.name, stepResult);
        }
      } catch (error) {
        await this.handleStepError(sagaId, sagaType, stepDefinition.name, error);
      }
    } catch (error) {
      this.logger.error(`Saga execution error for ${sagaId}: ${error.message}`);
      await this.failSaga(sagaId);
    }
  }

  private async completeStep(sagaId: string, sagaType: string, stepName: string, stepResult: any) {
    const stepRecord = await this.stepRepository.findOne({
      where: { sagaId, stepName },
    });

    if (stepRecord) {
      stepRecord.status = SagaStepStatus.COMPLETED;
      stepRecord.stepData = stepResult;
      await this.stepRepository.save(stepRecord);

      const saga = await this.sagaRepository.findOne({ where: { sagaId } });
      if (saga) {
        saga.currentStep = stepRecord.stepOrder + 1;
        await this.sagaRepository.save(saga);
        
        // Continue to next step
        setImmediate(() => this.executeNextStep(sagaId, sagaType));
      }
    }
  }

  private async handleStepError(sagaId: string, sagaType: string, stepName: string, error: Error) {
    const stepRecord = await this.stepRepository.findOne({
      where: { sagaId, stepName },
    });

    if (!stepRecord) return;

    this.logger.error(`Step ${stepName} failed for saga ${sagaId}: ${error.message}`);

    // Check if we can retry
    if (stepRecord.retryCount < stepRecord.maxRetries) {
      stepRecord.retryCount++;
      stepRecord.status = SagaStepStatus.PENDING;
      await this.stepRepository.save(stepRecord);

      // Retry with exponential backoff
      const retryDelay = Math.pow(2, stepRecord.retryCount) * 1000;
      setTimeout(() => {
        this.executeNextStep(sagaId, sagaType);
      }, retryDelay);
    } else {
      // Max retries exceeded, start compensation
      stepRecord.status = SagaStepStatus.FAILED;
      stepRecord.errorMessage = error.message;
      await this.stepRepository.save(stepRecord);
      await this.startCompensation(sagaId, sagaType);
    }
  }

  private async handleStepTimeout(sagaId: string, sagaType: string, stepName: string) {
    this.logger.error(`Step ${stepName} timed out for saga ${sagaId}`);
    
    // Remove from pending async steps
    this.pendingAsyncSteps.delete(`${sagaId}_${stepName}`);
    
    // Handle as error
    await this.handleStepError(sagaId, sagaType, stepName, new Error('Step timeout'));
  }

  private async startCompensation(sagaId: string, sagaType: string) {
    const saga = await this.sagaRepository.findOne({ where: { sagaId } });
    const steps = this.sagaSteps.get(sagaType);

    if (!saga || !steps) return;

    saga.status = SagaStatus.COMPENSATING;
    await this.sagaRepository.save(saga);

    this.logger.log(`Starting compensation for saga ${sagaId}`);

    // Get all completed steps in reverse order
    const completedSteps = await this.stepRepository.find({
      where: { sagaId, status: SagaStepStatus.COMPLETED },
      order: { stepOrder: 'DESC' },
    });

    let compensationFailed = false;

    for (const stepRecord of completedSteps) {
      const stepDefinition = steps.find((s) => s.name === stepRecord.stepName);
      if (stepDefinition) {
        try {
          this.logger.log(`Compensating step ${stepRecord.stepName} for saga ${sagaId}`);
          
          stepRecord.status = SagaStepStatus.COMPENSATING;
          await this.stepRepository.save(stepRecord);

          await stepDefinition.compensate(saga.payload, stepRecord.stepData);
          
          stepRecord.status = SagaStepStatus.COMPENSATED;
          await this.stepRepository.save(stepRecord);
          
          this.logger.log(`Successfully compensated step ${stepRecord.stepName} for saga ${sagaId}`);
        } catch (error) {
          this.logger.error(`Compensation failed for step ${stepRecord.stepName}: ${error.message}`);
          stepRecord.status = SagaStepStatus.COMPENSATION_FAILED;
          stepRecord.errorMessage = error.message;
          await this.stepRepository.save(stepRecord);
          compensationFailed = true;
        }
      }
    }

    if (compensationFailed) {
      saga.status = SagaStatus.COMPENSATION_FAILED;
      await this.sagaRepository.save(saga);
      this.logger.error(`Saga ${sagaId} compensation partially failed - manual intervention required`);
    } else {
      await this.failSaga(sagaId);
    }
  }

  // Kafka Event Handlers
  @EventPattern('payment.created')
  async handlePaymentCreated(data: any) {
    const { orderId, paymentId, status } = data;
    const pendingKey = Object.keys(this.pendingAsyncSteps).find(key => 
      this.pendingAsyncSteps[key].stepName === 'CREATE_PAYMENT'
    );

    if (pendingKey) {
      const pending = this.pendingAsyncSteps.get(pendingKey);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingAsyncSteps.delete(pendingKey);

        if (status === 'CREATED') {
          await this.completeStep(pending.sagaId, pending.sagaType, 'CREATE_PAYMENT', {
            orderId,
            paymentId,
            status
          });
        } else {
          await this.handleStepError(
            pending.sagaId, 
            pending.sagaType, 
            'CREATE_PAYMENT', 
            new Error(`Payment creation failed: ${status}`)
          );
        }
      }
    }
  }

  @EventPattern('payment.captured')
  async handlePaymentCaptured(data: any) {
    const { orderId, paymentId, status } = data;
    const pendingKey = Object.keys(this.pendingAsyncSteps).find(key => 
      this.pendingAsyncSteps[key].stepName === 'PROCESS_PAYMENT'
    );

    if (pendingKey) {
      const pending = this.pendingAsyncSteps.get(pendingKey);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingAsyncSteps.delete(pendingKey);

        await this.completeStep(pending.sagaId, pending.sagaType, 'PROCESS_PAYMENT', {
          orderId,
          paymentId,
          status: 'CAPTURED'
        });
      }
    }
  }

  @EventPattern('payment.failed')
  async handlePaymentFailed(data: any) {
    const { orderId, paymentId, error } = data;
    const pendingKey = Object.keys(this.pendingAsyncSteps).find(key => 
      this.pendingAsyncSteps[key].stepName === 'PROCESS_PAYMENT'
    );

    if (pendingKey) {
      const pending = this.pendingAsyncSteps.get(pendingKey);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingAsyncSteps.delete(pendingKey);

        await this.handleStepError(
          pending.sagaId,
          pending.sagaType,
          'PROCESS_PAYMENT',
          new Error(`Payment failed: ${error}`)
        );
      }
    }
  }

  // Step Implementation Methods
  private async validateOrder(payload: any): Promise<any> {
    this.logger.log(`Validating order: ${payload.orderId}`);
    const order = await this.orderService.getOrder(payload.orderId);
    if (!order || order.status !== OrderStatus.PENDING) {
      throw new Error('Invalid order or not in pending status');
    }
    return { orderId: order.id, validated: true, originalStatus: order.status };
  }

  private async cancelOrder(payload: any, stepData: any): Promise<void> {
    this.logger.log(`Cancelling order: ${payload.orderId}`);
    await this.orderService.updateOrderStatus(payload.orderId, OrderStatus.CANCELLED);
  }

  private async createPayment(payload: any): Promise<any> {
    this.logger.log(`Creating payment for order: ${payload.orderId}`);
    
    const createPaymentMessage = {
      orderId: payload.orderId,
      amount: payload.amount,
      currency: payload.currency,
      method: payload.paymentMethod,
      email: payload.email,
      contact: payload.contact,
      idempotencyKey: `payment_${payload.orderId}_${Date.now()}`,
    };

    this.kafkaClient.emit('payment.create.requested', createPaymentMessage);
    
    // Return immediately - completion handled by event
    return { orderId: payload.orderId, paymentRequestSent: true };
  }

  private async cancelPayment(payload: any, stepData: any): Promise<void> {
    this.logger.log(`Cancelling payment for order: ${payload.orderId}`);
    this.kafkaClient.emit('payment.cancel.requested', {
      orderId: payload.orderId,
      paymentId: stepData.paymentId,
    });
  }

  private async processPayment(payload: any): Promise<any> {
    this.logger.log(`Processing payment for order: ${payload.orderId}`);
    
    this.kafkaClient.emit('payment.process.requested', {
      orderId: payload.orderId,
      idempotencyKey: `process_${payload.orderId}_${Date.now()}`,
    });
    
    // Return immediately - completion handled by event
    return { orderId: payload.orderId, processRequestSent: true };
  }

  private async refundPayment(payload: any, stepData: any): Promise<void> {
    this.logger.log(`Refunding payment for order: ${payload.orderId}`);
    this.kafkaClient.emit('payment.refund.requested', {
      orderId: payload.orderId,
      paymentId: stepData.paymentId,
    });
  }

  private async updateOrderStatus(payload: any): Promise<any> {
    this.logger.log(`Updating order status to PAID: ${payload.orderId}`);
    const originalOrder = await this.orderService.getOrder(payload.orderId);
    await this.orderService.updateOrderStatus(payload.orderId, OrderStatus.PAID);
    return { 
      orderId: payload.orderId, 
      newStatus: OrderStatus.PAID,
      previousStatus: originalOrder.status 
    };
  }

  private async revertOrderStatus(payload: any, stepData: any): Promise<void> {
    this.logger.log(`Reverting order status for: ${payload.orderId}`);
    await this.orderService.updateOrderStatus(payload.orderId, stepData.previousStatus);
  }

  // Recovery Methods
  private async resumeInterruptedSagas() {
    this.logger.log('Resuming interrupted sagas...');
    
    const interruptedSagas = await this.sagaRepository.find({
      where: { status: SagaStatus.STARTED },
    });

    for (const saga of interruptedSagas) {
      this.logger.log(`Resuming saga ${saga.sagaId}`);
      // Determine saga type based on steps or payload
      const sagaType = 'PAYMENT_SAGA'; // This should be stored in the saga entity
      setImmediate(() => this.executeNextStep(saga.sagaId, sagaType));
    }
  }

  // Utility Methods
  private async completeSaga(sagaId: string) {
    const saga = await this.sagaRepository.findOne({ where: { sagaId } });
    if (saga) {
      saga.status = SagaStatus.COMPLETED;
      saga.completedAt = new Date();
      await this.sagaRepository.save(saga);
      this.logger.log(`Saga ${sagaId} completed successfully`);
    }
  }

  private async failSaga(sagaId: string) {
    const saga = await this.sagaRepository.findOne({ where: { sagaId } });
    if (saga) {
      saga.status = SagaStatus.FAILED;
      saga.completedAt = new Date();
      await this.sagaRepository.save(saga);
      this.logger.log(`Saga ${sagaId} failed`);
    }
  }

  private generateSagaId(): string {
    return `saga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API Methods
  async getSagaStatus(sagaId: string) {
    const saga = await this.sagaRepository.findOne({ where: { sagaId } });
    const steps = await this.stepRepository.find({
      where: { sagaId },
      order: { stepOrder: 'ASC' },
    });
    
    return {
      saga,
      steps,
      progress: saga ? (saga.currentStep / saga.totalSteps) * 100 : 0,
      isComplete: saga?.status === SagaStatus.COMPLETED,
      isFailed: saga?.status === SagaStatus.FAILED || saga?.status === SagaStatus.COMPENSATION_FAILED,
      isCompensating: saga?.status === SagaStatus.COMPENSATING,
    };
  }

  async retrySaga(sagaId: string): Promise<boolean> {
    const saga = await this.sagaRepository.findOne({ where: { sagaId } });
    
    if (!saga || saga.status !== SagaStatus.FAILED) {
      return false;
    }

    // Reset saga to restart from failed step
    const failedStep = await this.stepRepository.findOne({
      where: { sagaId, status: SagaStepStatus.FAILED },
      order: { stepOrder: 'ASC' },
    });

    if (failedStep) {
      saga.status = SagaStatus.STARTED;
      saga.currentStep = failedStep.stepOrder;
      await this.sagaRepository.save(saga);

      failedStep.status = SagaStepStatus.PENDING;
      failedStep.retryCount = 0;
      failedStep.errorMessage = null;
      await this.stepRepository.save(failedStep);

      // Resume execution
      const sagaType = 'PAYMENT_SAGA'; // Should be stored in saga entity
      setImmediate(() => this.executeNextStep(sagaId, sagaType));
      
      return true;
    }

    return false;
  }
}