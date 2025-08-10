

// shared/utils/saga-logger.util.ts
import { Logger } from '@nestjs/common';

export class SagaLogger {
  private static instance: SagaLogger;
  private logger = new Logger('Saga');

  static getInstance(): SagaLogger {
    if (!SagaLogger.instance) {
      SagaLogger.instance = new SagaLogger();
    }
    return SagaLogger.instance;
  }

  logSagaStart(sagaId: string, type: string, payload: any): void {
    this.logger.log(`🎬 SAGA_STARTED: ${sagaId} [${type}]`, {
      sagaId,
      type,
      payload,
      timestamp: new Date().toISOString(),
    });
  }

  logSagaStep(sagaId: string, step: string, status: string, data?: any): void {
    const emoji = status === 'success' ? '✅' : status === 'failed' ? '❌' : '🔄';
    this.logger.log(`${emoji} SAGA_STEP: ${sagaId} [${step}] - ${status}`, {
      sagaId,
      step,
      status,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  logSagaComplete(sagaId: string, finalStatus: string, duration?: number): void {
    const emoji = finalStatus === 'completed' ? '🎉' : '💀';
    this.logger.log(`${emoji} SAGA_COMPLETE: ${sagaId} - ${finalStatus}`, {
      sagaId,
      finalStatus,
      duration,
      timestamp: new Date().toISOString(),
    });
  }

  logSagaCompensation(sagaId: string, step: string, reason: string): void {
    this.logger.warn(`🔄 SAGA_COMPENSATION: ${sagaId} [${step}] - ${reason}`, {
      sagaId,
      step,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  logSagaError(sagaId: string, error: Error, context?: any): void {
    this.logger.error(`💥 SAGA_ERROR: ${sagaId} - ${error.message}`, error.stack, {
      sagaId,
      error: error.message,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}