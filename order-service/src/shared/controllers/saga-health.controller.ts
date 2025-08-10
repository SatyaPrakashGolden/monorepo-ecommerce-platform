// shared/controllers/saga-health.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { SagaMonitorService } from '../services/saga-monitor.service';
import { SagaOrchestratorService } from '../services/saga-orchestrator.service';

@Controller('saga')
export class SagaHealthController {
  constructor(
    private readonly sagaMonitor: SagaMonitorService,
    private readonly sagaOrchestrator: SagaOrchestratorService,
  ) {}

  @Get('health')
  async getHealth() {
    const metrics = await this.sagaMonitor.getSagaMetrics();
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics,
    };
  }

  @Get('metrics')
  async getMetrics() {
    return await this.sagaMonitor.getSagaMetrics();
  }

  @Get('status/:sagaId')
  async getSagaStatus(@Param('sagaId') sagaId: string) {
    const saga = await this.sagaOrchestrator.getSagaState(sagaId);
    if (!saga) {
      return { error: 'Saga not found' };
    }
    return saga;
  }
}


