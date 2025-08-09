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
const order_entity_1 = require("./entities/order.entity");
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
    async handleOrderCreate(data) {
        try {
            const orderData = {
                user_id: data.payload.user_id,
                product_id: data.payload.cart_items.map(item => item.productId).join(','),
                total_amount: data.payload.total_amount,
                currency: data.payload.currency,
                saga_id: data.saga_id,
                status: order_entity_1.OrderStatus.PENDING,
            };
            const order = await this.orderService.createOrder(orderData);
            await this.orderService.kafkaClient.emit('saga.order.created', {
                saga_id: data.saga_id,
                step_id: data.step_id,
                order_id: order.id,
                created_at: order.created_at,
            });
        }
        catch (error) {
            this.logger.error('Failed to create order', error.stack);
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
    (0, microservices_1.EventPattern)('saga.order.create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "handleOrderCreate", null);
exports.OrderController = OrderController = OrderController_1 = __decorate([
    (0, common_1.Controller)('order'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderController);
//# sourceMappingURL=order.controller.js.map