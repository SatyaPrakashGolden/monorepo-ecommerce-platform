import { SagaOrchestratorService } from './saga-orchestrator.service';
import { Repository } from 'typeorm';
import { SagaState } from '../entities/saga-state.entity';
export declare class SagaMonitorService {
    private readonly sagaRepository;
    private readonly sagaOrchestrator;
    private readonly logger;
    constructor(sagaRepository: Repository<SagaState>, sagaOrchestrator: SagaOrchestratorService);
    handleSagaTimeouts(): Promise<void>;
    retryFailedSagas(): Promise<void>;
    cleanupOldSagas(): Promise<void>;
    getSagaMetrics(): Promise<any>;
}
