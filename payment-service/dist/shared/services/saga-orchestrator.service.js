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
var SagaOrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SagaOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const microservices_1 = require("@nestjs/microservices");
const saga_state_entity_1 = require("../entities/saga-state.entity");
const uuid_1 = require("uuid");
const saga_logger_util_1 = require("../utils/saga-logger.util");
let SagaOrchestratorService = SagaOrchestratorService_1 = class SagaOrchestratorService {
    sagaRepository;
    kafkaClient;
    logger = new common_1.Logger(SagaOrchestratorService_1.name);
    sagaLogger = saga_logger_util_1.SagaLogger.getInstance();
    constructor(sagaRepository, kafkaClient) {
        this.sagaRepository = sagaRepository;
        this.kafkaClient = kafkaClient;
    }
    async startOrderPaymentSaga(payload) {
        const sagaId = (0, uuid_1.v4)();
        const correlationId = (0, uuid_1.v4)();
        const saga = this.sagaRepository.create({
            saga_id: sagaId,
            correlation_id: correlationId,
            status: saga_state_entity_1.SagaStatus.STARTED,
            saga_type: 'ORDER_PAYMENT_SAGA',
            payload,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        await this.sagaRepository.save(saga);
        await this.emitEvent('order-creation-started', {
            sagaId,
            timestamp: Date.now(),
            correlationId,
            version: 1,
            type: 'ORDER_CREATION_STARTED',
            payload,
        });
        this.sagaLogger.logSagaStart(sagaId, 'ORDER_PAYMENT_SAGA', payload);
        this.logger.log(`Started Order Payment Saga: ${sagaId}`);
        return sagaId;
    }
    async updateSagaStatus(sagaId, status, payload, error) {
        try {
            const saga = await this.sagaRepository.findOne({
                where: { saga_id: sagaId },
            });
            if (!saga) {
                this.logger.error(`Saga not found: ${sagaId}`);
                return;
            }
            saga.status = status;
            if (payload) {
                saga.payload = { ...saga.payload, ...payload };
            }
            if (error) {
                saga.error_message = error;
            }
            if (payload?.razorpayOrderId) {
                saga.razorpay_order_id = payload.razorpayOrderId;
            }
            await this.sagaRepository.save(saga);
            this.sagaLogger.logSagaStep(sagaId, status, 'success', payload);
            this.logger.log(`Saga ${sagaId} status updated to ${status}`);
        }
        catch (err) {
            this.sagaLogger.logSagaError(sagaId, err);
            this.logger.error(`Failed to update saga ${sagaId}:`, err);
        }
    }
    async getSagaState(sagaId) {
        return await this.sagaRepository.findOne({
            where: { saga_id: sagaId },
        });
    }
    async findSagaByRazorpayOrderId(razorpayOrderId) {
        return await this.sagaRepository.findOne({
            where: { razorpay_order_id: razorpayOrderId },
        });
    }
    async handleSagaTimeout() {
        const expiredSagas = await this.sagaRepository
            .createQueryBuilder('saga')
            .where('saga.expires_at < :now', { now: new Date() })
            .andWhere('saga.status NOT IN (:...completedStatuses)', {
            completedStatuses: [
                saga_state_entity_1.SagaStatus.COMPLETED,
                saga_state_entity_1.SagaStatus.COMPENSATED,
            ],
        })
            .getMany();
        for (const saga of expiredSagas) {
            this.logger.warn(`Saga timeout detected: ${saga.saga_id}`);
            await this.compensateSaga(saga.saga_id, 'Saga timeout');
        }
    }
    async compensateSaga(sagaId, reason) {
        const saga = await this.getSagaState(sagaId);
        if (!saga)
            return;
        await this.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.COMPENSATING, null, reason);
        switch (saga.status) {
            case saga_state_entity_1.SagaStatus.PAYMENT_VERIFIED:
                await this.emitEvent('payment-reversal-requested', {
                    sagaId,
                    timestamp: Date.now(),
                    correlationId: saga.correlation_id,
                    version: 1,
                    type: 'PAYMENT_REVERSAL_REQUESTED',
                    payload: {
                        razorpayPaymentId: saga.payload.razorpayPaymentId,
                        razorpayOrderId: saga.payload.razorpayOrderId,
                        amount: saga.payload.amount,
                        reason,
                    },
                });
                break;
            case saga_state_entity_1.SagaStatus.ORDER_CREATED:
                await this.emitEvent('order-cancellation-requested', {
                    sagaId,
                    timestamp: Date.now(),
                    correlationId: saga.correlation_id,
                    version: 1,
                    type: 'ORDER_CANCELLATION_REQUESTED',
                    payload: {
                        razorpayOrderId: saga.payload.razorpayOrderId,
                        reason,
                    },
                });
                break;
        }
        this.sagaLogger.logSagaCompensation(sagaId, saga.status, reason);
    }
    async retrySaga(sagaId) {
        const saga = await this.getSagaState(sagaId);
        if (!saga)
            return false;
        if (saga.retry_count >= saga.max_retries) {
            await this.compensateSaga(sagaId, 'Max retries exceeded');
            return false;
        }
        saga.retry_count++;
        await this.sagaRepository.save(saga);
        return true;
    }
    async emitEvent(topic, event) {
        try {
            await this.kafkaClient.emit(topic, event).toPromise();
            this.logger.log(`Event emitted: ${topic}`, { sagaId: event.sagaId });
        }
        catch (error) {
            this.sagaLogger.logSagaError(event.sagaId, error);
            this.logger.error(`Failed to emit event ${topic}:`, error);
            throw error;
        }
    }
};
exports.SagaOrchestratorService = SagaOrchestratorService;
exports.SagaOrchestratorService = SagaOrchestratorService = SagaOrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(saga_state_entity_1.SagaState)),
    __param(1, (0, common_1.Inject)('KAFKA_SERVICE')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        microservices_1.ClientKafka])
], SagaOrchestratorService);
//# sourceMappingURL=saga-orchestrator.service.js.map