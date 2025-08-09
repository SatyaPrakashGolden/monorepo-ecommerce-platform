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
var PaymentSagaOrchestrator_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentSagaOrchestrator = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@nestjs/common");
const saga_entity_1 = require("./entities/saga.entity");
let PaymentSagaOrchestrator = PaymentSagaOrchestrator_1 = class PaymentSagaOrchestrator {
    sagaRepository;
    sagaStepRepository;
    kafkaClient;
    logger = new common_1.Logger(PaymentSagaOrchestrator_1.name);
    constructor(sagaRepository, sagaStepRepository, kafkaClient) {
        this.sagaRepository = sagaRepository;
        this.sagaStepRepository = sagaStepRepository;
        this.kafkaClient = kafkaClient;
    }
    async startPaymentSaga(payload) {
        const sagaId = `saga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
            const saga = this.sagaRepository.create({
                saga_id: sagaId,
                status: saga_entity_1.SagaStatus.IN_PROGRESS,
                payload,
                context: {},
                user_id: payload.user_id,
            });
            await this.sagaRepository.save(saga);
            const steps = [
                { type: saga_entity_1.SagaStepType.INVENTORY_RESERVE, order: 1 },
                { type: saga_entity_1.SagaStepType.ORDER_CREATE, order: 2 },
                { type: saga_entity_1.SagaStepType.PAYMENT_PROCESS, order: 3 },
                { type: saga_entity_1.SagaStepType.INVENTORY_CONFIRM, order: 4 },
                { type: saga_entity_1.SagaStepType.ORDER_CONFIRM, order: 5 },
                { type: saga_entity_1.SagaStepType.NOTIFICATION_SEND, order: 6 },
            ];
            for (const stepDef of steps) {
                const step = this.sagaStepRepository.create({
                    saga_id: sagaId,
                    step_type: stepDef.type,
                    step_order: stepDef.order,
                    status: saga_entity_1.SagaStepStatus.PENDING,
                    input_data: payload,
                });
                await this.sagaStepRepository.save(step);
            }
            await this.executeNextStep(sagaId);
            this.logger.log(`Payment saga started: ${sagaId}`);
            return sagaId;
        }
        catch (error) {
            this.logger.error(`Failed to start payment saga: ${error.message}`);
            await this.markSagaAsFailed(sagaId, error.message);
            throw error;
        }
    }
    async executeNextStep(sagaId) {
        const saga = await this.getSagaWithSteps(sagaId);
        if (!saga)
            return;
        const nextStep = saga.steps
            .filter(step => step.status === saga_entity_1.SagaStepStatus.PENDING)
            .sort((a, b) => a.step_order - b.step_order)[0];
        if (!nextStep) {
            await this.completeSaga(sagaId);
            return;
        }
        try {
            await this.executeStep(nextStep);
        }
        catch (error) {
            this.logger.error(`Step execution failed: ${error.message}`);
            await this.handleStepFailure(nextStep, error.message);
        }
    }
    async executeStep(step) {
        this.logger.log(`Executing step: ${step.step_type} for saga: ${step.saga_id}`);
        step.status = saga_entity_1.SagaStepStatus.EXECUTING;
        await this.sagaStepRepository.save(step);
        const saga = await this.getSagaWithSteps(step.saga_id);
        if (!saga) {
            this.logger.error(`Saga not found for step: ${step.saga_id}`);
            throw new Error(`Saga not found: ${step.saga_id}`);
        }
        const eventData = {
            saga_id: step.saga_id,
            step_id: step.id,
            payload: saga.payload,
            context: saga.context,
        };
        switch (step.step_type) {
            case saga_entity_1.SagaStepType.INVENTORY_RESERVE:
                await this.kafkaClient.emit('saga.inventory.reserve', eventData);
                break;
            case saga_entity_1.SagaStepType.ORDER_CREATE:
                await this.kafkaClient.emit('saga.order.create', eventData);
                break;
            case saga_entity_1.SagaStepType.PAYMENT_PROCESS:
                if (saga.context?.razorpay_order) {
                    await this.handleStepSuccess(step.id, {
                        razorpay_order_id: saga.context.razorpay_order.id,
                        razorpay_amount: saga.context.razorpay_order.amount,
                        razorpay_status: saga.context.razorpay_order.status,
                        razorpay_receipt: saga.context.razorpay_order.receipt,
                        payment_ready: true
                    });
                }
                else {
                    await this.kafkaClient.emit('saga.payment.process', eventData);
                }
                break;
            case saga_entity_1.SagaStepType.INVENTORY_CONFIRM:
                await this.kafkaClient.emit('saga.inventory.confirm', eventData);
                break;
            case saga_entity_1.SagaStepType.ORDER_CONFIRM:
                await this.kafkaClient.emit('saga.order.confirm', eventData);
                break;
            case saga_entity_1.SagaStepType.NOTIFICATION_SEND:
                await this.kafkaClient.emit('saga.notification.send', eventData);
                break;
        }
    }
    async handleStepSuccess(stepId, outputData) {
        const step = await this.sagaStepRepository.findOne({ where: { id: stepId } });
        if (!step)
            return;
        step.status = saga_entity_1.SagaStepStatus.COMPLETED;
        step.output_data = outputData;
        await this.sagaStepRepository.save(step);
        if (outputData) {
            const saga = await this.sagaRepository.findOne({ where: { saga_id: step.saga_id } });
            if (saga) {
                saga.context = { ...saga.context, [step.step_type]: outputData };
                await this.sagaRepository.save(saga);
            }
        }
        this.logger.log(`Step completed: ${step.step_type} for saga: ${step.saga_id}`);
        await this.executeNextStep(step.saga_id);
    }
    async handleStepFailure(step, errorMessage) {
        if (step.retry_count < step.max_retries) {
            step.retry_count++;
            step.status = saga_entity_1.SagaStepStatus.PENDING;
            step.error_message = errorMessage;
            await this.sagaStepRepository.save(step);
            this.logger.log(`Retrying step: ${step.step_type} (${step.retry_count}/${step.max_retries})`);
            setTimeout(() => this.executeStep(step), 5000 * step.retry_count);
        }
        else {
            step.status = saga_entity_1.SagaStepStatus.FAILED;
            step.error_message = errorMessage;
            await this.sagaStepRepository.save(step);
            await this.startCompensation(step.saga_id);
        }
    }
    async startCompensation(sagaId) {
        this.logger.log(`Starting compensation for saga: ${sagaId}`);
        const saga = await this.getSagaWithSteps(sagaId);
        if (!saga)
            return;
        saga.status = saga_entity_1.SagaStatus.COMPENSATING;
        await this.sagaRepository.save(saga);
        const completedSteps = saga.steps
            .filter(step => step.status === saga_entity_1.SagaStepStatus.COMPLETED)
            .sort((a, b) => b.step_order - a.step_order);
        for (const step of completedSteps) {
            await this.compensateStep(step);
        }
        saga.status = saga_entity_1.SagaStatus.COMPENSATED;
        await this.sagaRepository.save(saga);
    }
    async compensateStep(step) {
        this.logger.log(`Compensating step: ${step.step_type} for saga: ${step.saga_id}`);
        step.status = saga_entity_1.SagaStepStatus.COMPENSATING;
        await this.sagaStepRepository.save(step);
        const saga = await this.getSagaWithSteps(step.saga_id);
        if (!saga) {
            this.logger.error(`Saga not found for compensation: ${step.saga_id}`);
            throw new Error(`Saga not found: ${step.saga_id}`);
        }
        const eventData = {
            saga_id: step.saga_id,
            step_id: step.id,
            payload: saga.payload,
            context: saga.context,
            compensation_data: step.output_data,
        };
        try {
            switch (step.step_type) {
                case saga_entity_1.SagaStepType.INVENTORY_RESERVE:
                    await this.kafkaClient.emit('saga.inventory.release', eventData);
                    break;
                case saga_entity_1.SagaStepType.ORDER_CREATE:
                    await this.kafkaClient.emit('saga.order.cancel', eventData);
                    break;
                case saga_entity_1.SagaStepType.PAYMENT_PROCESS:
                    await this.kafkaClient.emit('saga.payment.refund', eventData);
                    break;
                case saga_entity_1.SagaStepType.INVENTORY_CONFIRM:
                    await this.kafkaClient.emit('saga.inventory.release', eventData);
                    break;
                case saga_entity_1.SagaStepType.ORDER_CONFIRM:
                    await this.kafkaClient.emit('saga.order.cancel', eventData);
                    break;
                case saga_entity_1.SagaStepType.NOTIFICATION_SEND:
                    await this.kafkaClient.emit('saga.notification.cancel', eventData);
                    break;
            }
            step.status = saga_entity_1.SagaStepStatus.COMPENSATED;
            await this.sagaStepRepository.save(step);
        }
        catch (error) {
            this.logger.error(`Compensation failed for step ${step.step_type}: ${error.message}`);
            step.error_message = `Compensation failed: ${error.message}`;
            await this.sagaStepRepository.save(step);
        }
    }
    async completeSaga(sagaId) {
        const saga = await this.sagaRepository.findOne({ where: { saga_id: sagaId } });
        if (!saga)
            return;
        saga.status = saga_entity_1.SagaStatus.COMPLETED;
        await this.sagaRepository.save(saga);
        this.logger.log(`Saga completed successfully: ${sagaId}`);
        await this.kafkaClient.emit('saga.payment.completed', {
            saga_id: sagaId,
            user_id: saga.user_id,
            payment_id: saga.payment_id,
            razorpay_order_id: saga.razorpay_order_id,
        });
    }
    async markSagaAsFailed(sagaId, errorMessage) {
        const saga = await this.sagaRepository.findOne({ where: { saga_id: sagaId } });
        if (!saga)
            return;
        saga.status = saga_entity_1.SagaStatus.FAILED;
        saga.error_message = errorMessage;
        await this.sagaRepository.save(saga);
    }
    async getSagaWithSteps(sagaId) {
        return this.sagaRepository.findOne({
            where: { saga_id: sagaId },
            relations: ['steps'],
        });
    }
};
exports.PaymentSagaOrchestrator = PaymentSagaOrchestrator;
exports.PaymentSagaOrchestrator = PaymentSagaOrchestrator = PaymentSagaOrchestrator_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(saga_entity_1.Saga)),
    __param(1, (0, typeorm_1.InjectRepository)(saga_entity_1.SagaStep)),
    __param(2, (0, common_2.Inject)('KAFKA_SERVICE')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        microservices_1.ClientKafka])
], PaymentSagaOrchestrator);
//# sourceMappingURL=payment-saga-orchestrator.service.js.map