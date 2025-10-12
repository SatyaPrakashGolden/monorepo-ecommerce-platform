import { SagaMonitorService } from '../services/saga-monitor.service';
import { SagaOrchestratorService } from '../services/saga-orchestrator.service';
export declare class SagaHealthController {
    private readonly sagaMonitor;
    private readonly sagaOrchestrator;
    constructor(sagaMonitor: SagaMonitorService, sagaOrchestrator: SagaOrchestratorService);
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        metrics: any;
    }>;
    getMetrics(): Promise<any>;
    getSagaStatus(sagaId: string): Promise<import("../entities/saga-state.entity").SagaState | {
        error: string;
    }>;
}
