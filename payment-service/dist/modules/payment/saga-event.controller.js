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
var SagaEventController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SagaEventController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const payment_saga_orchestrator_service_1 = require("./payment-saga-orchestrator.service");
const payment_service_1 = require("./payment.service");
let SagaEventController = SagaEventController_1 = class SagaEventController {
    sagaOrchestrator;
    paymentService;
    logger = new common_1.Logger(SagaEventController_1.name);
    constructor(sagaOrchestrator, paymentService) {
        this.sagaOrchestrator = sagaOrchestrator;
        this.paymentService = paymentService;
    }
    async handleInventoryReserved(data) {
        this.logger.log(`Received saga.inventory.reserved: ${JSON.stringify(data)}`);
        try {
            await this.sagaOrchestrator.handleStepSuccess(data.step_id, {
                inventory_reserved: true,
                reserved_items: data.reserved_items,
            });
        }
        catch (error) {
            this.logger.error(`Error in handleInventoryReserved: ${error.message}`, error.stack);
            const step = await this.sagaOrchestrator['sagaStepRepository'].findOne({ where: { id: data.step_id } });
            if (step) {
                await this.sagaOrchestrator.handleStepFailure(step, error.message);
            }
        }
    }
    async handleOrderCreated(data) {
        this.logger.log(`Received saga.order.created: ${JSON.stringify(data)}`);
        try {
            await this.sagaOrchestrator.handleStepSuccess(data.step_id, {
                order_id: data.order_id,
                order_created_at: data.created_at,
            });
        }
        catch (error) {
            this.logger.error(`Error in handleOrderCreated: ${error.message}`, error.stack);
            const step = await this.sagaOrchestrator['sagaStepRepository'].findOne({ where: { id: data.step_id } });
            if (step) {
                await this.sagaOrchestrator.handleStepFailure(step, error.message);
            }
        }
    }
    async handlePaymentProcess(data) {
        this.logger.log(`Received saga.payment.process: ${JSON.stringify(data)}`);
        try {
            const saga = await this.sagaOrchestrator['sagaRepository'].findOne({
                where: { saga_id: data.saga_id }
            });
            if (!saga) {
                throw new Error(`Saga not found: ${data.saga_id}`);
            }
            if (saga.razorpay_order_id) {
                this.logger.log(`Razorpay order already exists: ${saga.razorpay_order_id}`);
                await this.sagaOrchestrator.handleStepSuccess(data.step_id, {
                    razorpay_order_id: saga.razorpay_order_id,
                    payment_ready: true,
                    already_created: true
                });
                return;
            }
            const product_id = data.payload.cart_items?.map(item => item.productId).join(',') || 'unknown';
            const razorpayOrder = await this.paymentService.createRazorpayOrder({
                total_amount: data.payload.total_amount,
                currency: data.payload.currency,
                user_id: data.payload.user_id,
                product_id: product_id,
                saga_id: data.saga_id,
            });
            this.logger.log(`Razorpay order created: ${JSON.stringify(razorpayOrder)}`);
            saga.razorpay_order_id = razorpayOrder.id;
            await this.sagaOrchestrator['sagaRepository'].save(saga);
            this.logger.log(`Saga updated with razorpay_order_id: ${razorpayOrder.id}`);
            await this.sagaOrchestrator.handleStepSuccess(data.step_id, {
                razorpay_order_id: razorpayOrder.id,
                razorpay_amount: razorpayOrder.amount,
                razorpay_status: razorpayOrder.status,
                razorpay_receipt: razorpayOrder.receipt,
            });
        }
        catch (error) {
            this.logger.error(`Error in handlePaymentProcess: ${error.message}`, error.stack);
            const step = await this.sagaOrchestrator['sagaStepRepository'].findOne({ where: { id: data.step_id } });
            if (step) {
                await this.sagaOrchestrator.handleStepFailure(step, error.message);
            }
            else {
                await this.sagaOrchestrator.startCompensation(data.saga_id);
            }
        }
    }
    async handlePaymentSuccess(data) {
        this.logger.log(`Received saga.payment.success: ${JSON.stringify(data)}`);
        try {
            const verificationResult = await this.paymentService.verifyPayment({
                razorpay_payment_id: data.payment_id,
                razorpay_order_id: data.order_id,
                razorpay_signature: data.signature,
            });
            if (verificationResult.success) {
                const saga = await this.sagaOrchestrator['sagaRepository'].findOne({ where: { saga_id: data.saga_id } });
                if (saga) {
                    saga.payment_id = data.payment_id;
                    await this.sagaOrchestrator['sagaRepository'].save(saga);
                }
                await this.sagaOrchestrator.executeNextStep(data.saga_id);
            }
            else {
                throw new Error('Payment verification failed');
            }
        }
        catch (error) {
            this.logger.error(`Payment success handling failed: ${error.message}`, error.stack);
            await this.sagaOrchestrator.startCompensation(data.saga_id);
        }
    }
    async handlePaymentFailure(data) {
        this.logger.log(`Received saga.payment.failed: ${JSON.stringify(data)}`);
        try {
            await this.sagaOrchestrator.startCompensation(data.saga_id);
        }
        catch (error) {
            this.logger.error(`Payment failure handling failed: ${error.message}`, error.stack);
        }
    }
    async handleInventoryConfirmed(data) {
        this.logger.log(`Received saga.inventory.confirmed: ${JSON.stringify(data)}`);
        try {
            await this.sagaOrchestrator.handleStepSuccess(data.step_id, {
                inventory_confirmed: true,
                confirmation_details: data.confirmation_details,
            });
        }
        catch (error) {
            this.logger.error(`Error in handleInventoryConfirmed: ${error.message}`, error.stack);
            const step = await this.sagaOrchestrator['sagaStepRepository'].findOne({ where: { id: data.step_id } });
            if (step) {
                await this.sagaOrchestrator.handleStepFailure(step, error.message);
            }
        }
    }
    async handleOrderConfirmed(data) {
        this.logger.log(`Received saga.order.confirmed: ${JSON.stringify(data)}`);
        try {
            await this.sagaOrchestrator.handleStepSuccess(data.step_id, {
                order_confirmed: true,
                confirmation_details: data.confirmation_details,
            });
        }
        catch (error) {
            this.logger.error(`Error in handleOrderConfirmed: ${error.message}`, error.stack);
            const step = await this.sagaOrchestrator['sagaStepRepository'].findOne({ where: { id: data.step_id } });
            if (step) {
                await this.sagaOrchestrator.handleStepFailure(step, error.message);
            }
        }
    }
    async handleNotificationSent(data) {
        this.logger.log(`Received saga.notification.sent: ${JSON.stringify(data)}`);
        try {
            await this.sagaOrchestrator.handleStepSuccess(data.step_id, {
                notification_sent: true,
                notification_details: data.notification_details,
            });
        }
        catch (error) {
            this.logger.error(`Error in handleNotificationSent: ${error.message}`, error.stack);
            const step = await this.sagaOrchestrator['sagaStepRepository'].findOne({ where: { id: data.step_id } });
            if (step) {
                await this.sagaOrchestrator.handleStepFailure(step, error.message);
            }
        }
    }
};
exports.SagaEventController = SagaEventController;
__decorate([
    (0, microservices_1.EventPattern)('saga.inventory.reserved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SagaEventController.prototype, "handleInventoryReserved", null);
__decorate([
    (0, microservices_1.EventPattern)('saga.order.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SagaEventController.prototype, "handleOrderCreated", null);
__decorate([
    (0, microservices_1.EventPattern)('saga.payment.process'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SagaEventController.prototype, "handlePaymentProcess", null);
__decorate([
    (0, microservices_1.EventPattern)('saga.payment.success'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SagaEventController.prototype, "handlePaymentSuccess", null);
__decorate([
    (0, microservices_1.EventPattern)('saga.payment.failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SagaEventController.prototype, "handlePaymentFailure", null);
__decorate([
    (0, microservices_1.EventPattern)('saga.inventory.confirmed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SagaEventController.prototype, "handleInventoryConfirmed", null);
__decorate([
    (0, microservices_1.EventPattern)('saga.order.confirmed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SagaEventController.prototype, "handleOrderConfirmed", null);
__decorate([
    (0, microservices_1.EventPattern)('saga.notification.sent'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SagaEventController.prototype, "handleNotificationSent", null);
exports.SagaEventController = SagaEventController = SagaEventController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [payment_saga_orchestrator_service_1.PaymentSagaOrchestrator,
        payment_service_1.PaymentService])
], SagaEventController);
//# sourceMappingURL=saga-event.controller.js.map