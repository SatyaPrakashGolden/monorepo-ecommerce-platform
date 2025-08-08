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
const order_entity_1 = require("./entities/order.entity");
let OrderController = OrderController_1 = class OrderController {
    orderService;
    logger = new common_1.Logger(OrderController_1.name);
    constructor(orderService) {
        this.orderService = orderService;
    }
    async createOrder(createOrderDto) {
        return this.orderService.createOrder(createOrderDto);
    }
    async handlePaymentOrderCreated(data) {
        try {
            this.logger.log(`Received payment-order-created event: ${JSON.stringify(data)}`);
            const createOrderDto = {
                user_id: data.user_id,
                product_id: data.product_id || data.variant_id,
                total_amount: parseFloat(data.total_amount),
                currency: data.currency || 'INR',
                status: order_entity_1.OrderStatus.PENDING,
                razorpay_order_id: data.razorpay_order_id,
                receipt: data.receipt,
                razorpay_created_at: data.razorpay_created_at,
            };
            await this.orderService.createOrder(createOrderDto);
        }
        catch (error) {
            this.logger.error('Failed to handle payment-order-created event', error.stack);
        }
    }
    async handlePaymentVerified(data) {
        try {
            this.logger.log(`Received payment-verified event: ${JSON.stringify(data)}`);
            await this.orderService.markOrderAsPaid(data.razorpay_order_id);
        }
        catch (error) {
            this.logger.error('Failed to handle payment-verified event', error.stack);
        }
    }
    async handlePaymentFailed(data) {
        try {
            this.logger.log(`Received payment-failed event: ${JSON.stringify(data)}`);
            await this.orderService.markOrderAsFailed(data.razorpay_order_id, data.error_description);
        }
        catch (error) {
            this.logger.error('Failed to handle payment-failed event', error.stack);
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
    (0, microservices_1.EventPattern)('payment-order-created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "handlePaymentOrderCreated", null);
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
exports.OrderController = OrderController = OrderController_1 = __decorate([
    (0, common_1.Controller)('order'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderController);
//# sourceMappingURL=order.controller.js.map