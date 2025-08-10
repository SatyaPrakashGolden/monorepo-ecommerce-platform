"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SagaMonitorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SagaMonitorService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const saga_orchestrator_service_1 = require("./saga-orchestrator.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const saga_state_entity_1 = require("../entities/saga-state.entity");
let SagaMonitorService = SagaMonitorService_1 = class SagaMonitorService {
    sagaRepository;
    sagaOrchestrator;
    logger = new common_1.Logger(SagaMonitorService_1.name);
    constructor(sagaRepository, sagaOrchestrator) {
        this.sagaRepository = sagaRepository;
        this.sagaOrchestrator = sagaOrchestrator;
    }
    async handleSagaTimeouts() {
        try {
            await this.sagaOrchestrator.handleSagaTimeout();
        }
        catch (error) {
            this.logger.error('Error handling saga timeouts:', error);
        }
    }
    async retryFailedSagas() {
        try {
            const failedSagas = await this.sagaRepository.find({
                where: {
                    status: saga_state_entity_1.SagaStatus.FAILED,
                    retry_count: (0, typeorm_2.LessThan)(3),
                    updated_at: (0, typeorm_2.LessThan)(new Date(Date.now() - 5 * 60 * 1000)),
                },
                take: 10,
            });
            for (const saga of failedSagas) {
                this.logger.log(`Retrying failed saga: ${saga.saga_id}`);
                await this.sagaOrchestrator.retrySaga(saga.saga_id);
            }
        }
        catch (error) {
            this.logger.error('Error retrying failed sagas:', error);
        }
    }
    async cleanupOldSagas() {
        try {
            const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const result = await this.sagaRepository.delete({
                created_at: (0, typeorm_2.LessThan)(cutoffDate),
                status: (0, typeorm_2.In)([saga_state_entity_1.SagaStatus.COMPLETED, saga_state_entity_1.SagaStatus.COMPENSATED]),
            });
            this.logger.log(`Cleaned up ${result.affected} old saga records`);
        }
        catch (error) {
            this.logger.error('Error cleaning up old sagas:', error);
        }
    }
    async getSagaMetrics() {
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
                completedStatuses: [saga_state_entity_1.SagaStatus.COMPLETED, saga_state_entity_1.SagaStatus.COMPENSATED],
            })
                .getRawOne();
            return {
                totalSagas,
                statusDistribution: metrics,
                averageDurationSeconds: parseFloat(avgDuration.avg_duration) || 0,
            };
        }
        catch (error) {
            this.logger.error('Error getting saga metrics:', error);
            return null;
        }
    }
};
exports.SagaMonitorService = SagaMonitorService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SagaMonitorService.prototype, "handleSagaTimeouts", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SagaMonitorService.prototype, "retryFailedSagas", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SagaMonitorService.prototype, "cleanupOldSagas", null);
exports.SagaMonitorService = SagaMonitorService = SagaMonitorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(saga_state_entity_1.SagaState)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        saga_orchestrator_service_1.SagaOrchestratorService])
], SagaMonitorService);
//# sourceMappingURL=saga-monitor.service.js.map