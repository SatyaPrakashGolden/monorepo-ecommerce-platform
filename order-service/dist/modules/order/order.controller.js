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
var OrderController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("./order.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const microservices_1 = require("@nestjs/microservices");
let OrderController = OrderController_1 = class OrderController {
    orderService;
    logger = new common_1.Logger(OrderController_1.name);
    constructor(orderService) {
        this.orderService = orderService;
    }
    async createOrder(createOrderDto) {
        return this.orderService.createOrder(createOrderDto);
    }
    async handleOrderCreationStarted(data) {
        try {
            this.logger.log(`Received order-creation-started event: ${JSON.stringify(data)}`);
        }
        catch (error) {
            this.logger.error('Failed to handle order-creation-started event', error.stack);
        }
    }
    async handleOrderCreated(data) {
        try {
            this.logger.log(`Received order-created event: ${JSON.stringify(data)}`);
            await this.orderService.handleOrderCreated(data);
        }
        catch (error) {
            this.logger.error('Failed to handle order-created event', error.stack);
        }
    }
    async handlePaymentProcessingStarted(data) {
        try {
            this.logger.log(`Received payment-processing-started event: ${JSON.stringify(data)}`);
        }
        catch (error) {
            this.logger.error('Failed to handle payment-processing-started event', error.stack);
        }
    }
    async handlePaymentVerified(data) {
        try {
            this.logger.log(`Received payment-verified event: ${JSON.stringify(data)}`);
            await this.orderService.handlePaymentVerified(data);
        }
        catch (error) {
            this.logger.error('Failed to handle payment-verified event', error.stack);
        }
    }
    async handlePaymentFailed(data) {
        try {
            this.logger.log(`Received payment-failed event: ${JSON.stringify(data)}`);
            await this.orderService.handlePaymentFailed(data);
        }
        catch (error) {
            this.logger.error('Failed to handle payment-failed event', error.stack);
        }
    }
    async handleOrderCancellationRequest(data) {
        try {
            this.logger.log(`Received order-cancellation-requested event: ${JSON.stringify(data)}`);
            await this.orderService.handleOrderCancellationRequest(data);
        }
        catch (error) {
            this.logger.error('Failed to handle order-cancellation-requested event', error.stack);
        }
    }
    async handlePaymentReversalRequest(data) {
        try {
            this.logger.log(`Received payment-reversal-requested event: ${JSON.stringify(data)}`);
        }
        catch (error) {
            this.logger.error('Failed to handle payment-reversal-requested event', error.stack);
        }
    }
    async handlePaymentReversed(data) {
        try {
            this.logger.log(`Received payment-reversed event: ${JSON.stringify(data)}`);
        }
        catch (error) {
            this.logger.error('Failed to handle payment-reversed event', error.stack);
        }
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Post)('create-order'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrder", null);
__decorate([
    (0, microservices_1.EventPattern)('order-creation-started'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "handleOrderCreationStarted", null);
__decorate([
    (0, microservices_1.EventPattern)('order-created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "handleOrderCreated", null);
__decorate([
    (0, microservices_1.EventPattern)('payment-processing-started'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "handlePaymentProcessingStarted", null);
__decorate([
    (0, microservices_1.EventPattern)('payment-verified'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "handlePaymentVerified", null);
__decorate([
    (0, microservices_1.EventPattern)('payment-failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "handlePaymentFailed", null);
__decorate([
    (0, microservices_1.EventPattern)('order-cancellation-requested'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "handleOrderCancellationRequest", null);
__decorate([
    (0, microservices_1.EventPattern)('payment-reversal-requested'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "handlePaymentReversalRequest", null);
__decorate([
    (0, microservices_1.EventPattern)('payment-reversed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "handlePaymentReversed", null);
exports.OrderController = OrderController = OrderController_1 = __decorate([
    (0, common_1.Controller)('order'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderController);
//# sourceMappingURL=order.controller.js.map