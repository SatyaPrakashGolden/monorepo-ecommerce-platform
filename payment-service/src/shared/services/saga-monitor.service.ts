// shared/services/saga-monitor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SagaOrchestratorService } from './saga-orchestrator.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Not, In } from 'typeorm';
import { SagaState, SagaStatus } from '../entities/saga-state.entity';

@Injectable()
export class SagaMonitorService {
  private readonly logger = new Logger(SagaMonitorService.name);

  constructor(
    @InjectRepository(SagaState)
    private readonly sagaRepository: Repository<SagaState>,
    private readonly sagaOrchestrator: SagaOrchestratorService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleSagaTimeouts(): Promise<void> {
    try {
      await this.sagaOrchestrator.handleSagaTimeout();
    } catch (error) {
      this.logger.error('Error handling saga timeouts:', error);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedSagas(): Promise<void> {
    try {
      const failedSagas = await this.sagaRepository.find({
        where: {
          status: SagaStatus.FAILED,
          retry_count: LessThan(3),
          updated_at: LessThan(new Date(Date.now() - 5 * 60 * 1000)), // 5 minutes ago
        },
        take: 10, // Limit to 10 retries per execution
      });

      for (const saga of failedSagas) {
        this.logger.log(`Retrying failed saga: ${saga.saga_id}`);
        await this.sagaOrchestrator.retrySaga(saga.saga_id);
      }
    } catch (error) {
      this.logger.error('Error retrying failed sagas:', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOldSagas(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      const result = await this.sagaRepository.delete({
        created_at: LessThan(cutoffDate),
        status: In([SagaStatus.COMPLETED, SagaStatus.COMPENSATED]),
      });

      this.logger.log(`Cleaned up ${result.affected} old saga records`);
    } catch (error) {
      this.logger.error('Error cleaning up old sagas:', error);
    }
  }

  async getSagaMetrics(): Promise<any> {
    try {
      const metrics = await this.sagaRepository
        .createQueryBuilder('saga')
        .select('saga.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('saga.status')
        .getRawMany();

      const totalSagas = await this.sagaRepository.count();
      const avgDuration = await this.sagaRepository
        .createQueryBuilder('saga')
        .select('AVG(EXTRACT(EPOCH FROM (saga.updated_at - saga.created_at)))', 'avg_duration')
        .where('saga.status IN (:...completedStatuses)', {
          completedStatuses: [SagaStatus.COMPLETED, SagaStatus.COMPENSATED],
        })
        .getRawOne();

      return {
        totalSagas,
        statusDistribution: metrics,
        averageDurationSeconds: parseFloat(avgDuration.avg_duration) || 0,
      };
    } catch (error) {
      this.logger.error('Error getting saga metrics:', error);
      return null;
    }
  }
}