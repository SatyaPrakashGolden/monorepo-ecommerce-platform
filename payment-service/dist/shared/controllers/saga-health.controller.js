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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SagaHealthController = void 0;
const common_1 = require("@nestjs/common");
const saga_monitor_service_1 = require("../services/saga-monitor.service");
const saga_orchestrator_service_1 = require("../services/saga-orchestrator.service");
let SagaHealthController = class SagaHealthController {
    sagaMonitor;
    sagaOrchestrator;
    constructor(sagaMonitor, sagaOrchestrator) {
        this.sagaMonitor = sagaMonitor;
        this.sagaOrchestrator = sagaOrchestrator;
    }
    async getHealth() {
        const metrics = await this.sagaMonitor.getSagaMetrics();
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            metrics,
        };
    }
    async getMetrics() {
        return await this.sagaMonitor.getSagaMetrics();
    }
    async getSagaStatus(sagaId) {
        const saga = await this.sagaOrchestrator.getSagaState(sagaId);
        if (!saga) {
            return { error: 'Saga not found' };
        }
        return saga;
    }
};
exports.SagaHealthController = SagaHealthController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SagaHealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SagaHealthController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('status/:sagaId'),
    __param(0, (0, common_1.Param)('sagaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SagaHealthController.prototype, "getSagaStatus", null);
exports.SagaHealthController = SagaHealthController = __decorate([
    (0, common_1.Controller)('saga'),
    __metadata("design:paramtypes", [saga_monitor_service_1.SagaMonitorService,
        saga_orchestrator_service_1.SagaOrchestratorService])
], SagaHealthController);
//# sourceMappingURL=saga-health.controller.js.map