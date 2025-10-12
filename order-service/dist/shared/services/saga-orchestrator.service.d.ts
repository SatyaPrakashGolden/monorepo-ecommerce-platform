import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { SagaState, SagaStatus } from '../entities/saga-state.entity';
export declare class SagaOrchestratorService {
    private readonly sagaRepository;
    private readonly kafkaClient;
    private readonly logger;
    private readonly sagaLogger;
    constructor(sagaRepository: Repository<SagaState>, kafkaClient: ClientKafka);
    startOrderPaymentSaga(payload: any): Promise<string>;
    updateSagaStatus(sagaId: string, status: SagaStatus, payload?: any, error?: string): Promise<void>;
    getSagaState(sagaId: string): Promise<SagaState | null>;
    findSagaByRazorpayOrderId(razorpayOrderId: string): Promise<SagaState | null>;
    handleSagaTimeout(): Promise<void>;
    compensateSaga(sagaId: string, reason: string): Promise<void>;
    retrySaga(sagaId: string): Promise<boolean>;
    private emitEvent;
}
