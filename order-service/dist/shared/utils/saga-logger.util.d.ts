export declare class SagaLogger {
    private static instance;
    private logger;
    static getInstance(): SagaLogger;
    logSagaStart(sagaId: string, type: string, payload: any): void;
    logSagaStep(sagaId: string, step: string, status: string, data?: any): void;
    logSagaComplete(sagaId: string, finalStatus: string, duration?: number): void;
    logSagaCompensation(sagaId: string, step: string, reason: string): void;
    logSagaError(sagaId: string, error: Error, context?: any): void;
}
