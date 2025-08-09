import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { Saga, SagaStep } from './entities/saga.entity';
export declare class PaymentSagaOrchestrator {
    private sagaRepository;
    private sagaStepRepository;
    private kafkaClient;
    private readonly logger;
    constructor(sagaRepository: Repository<Saga>, sagaStepRepository: Repository<SagaStep>, kafkaClient: ClientKafka);
    startPaymentSaga(payload: {
        user_id: number;
        cart_items: any[];
        total_amount: number;
        currency: string;
    }): Promise<string>;
    executeNextStep(sagaId: string): Promise<void>;
    private executeStep;
    handleStepSuccess(stepId: number, outputData?: any): Promise<void>;
    handleStepFailure(step: SagaStep, errorMessage: string): Promise<void>;
    startCompensation(sagaId: string): Promise<void>;
    private compensateStep;
    private completeSaga;
    private markSagaAsFailed;
    private getSagaWithSteps;
}
