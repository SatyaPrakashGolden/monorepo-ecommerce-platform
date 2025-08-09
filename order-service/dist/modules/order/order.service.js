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
var OrderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const microservices_1 = require("@nestjs/microservices");
let OrderService = OrderService_1 = class OrderService {
    orderRepository;
    kafkaClient;
    logger = new common_1.Logger(OrderService_1.name);
    constructor(orderRepository, kafkaClient) {
        this.orderRepository = orderRepository;
        this.kafkaClient = kafkaClient;
    }
    async createOrder(createOrderDto) {
        try {
            const orderData = {
                ...createOrderDto,
                total_amount: Number(createOrderDto.total_amount),
                status: createOrderDto.status || order_entity_1.OrderStatus.PENDING,
            };
            const order = this.orderRepository.create(orderData);
            const savedOrder = await this.orderRepository.save(order);
            this.logger.log(`Order created successfully: ${savedOrder.id}`);
            return savedOrder;
        }
        catch (error) {
            this.logger.error('Failed to create order', error.stack);
            throw new common_1.BadRequestException('Could not create order');
        }
    }
    async findOrderByRazorpayId(razorpayOrderId) {
        try {
            return await this.orderRepository.findOne({ where: { razorpay_order_id: razorpayOrderId } });
        }
        catch (error) {
            this.logger.error(`Failed to find order by razorpay_order_id: ${razorpayOrderId}`, error.stack);
            return null;
        }
    }
    async markOrderAsPaid(razorpayOrderId) {
        const order = await this.findOrderByRazorpayId(razorpayOrderId);
        if (!order) {
            throw new common_1.NotFoundException(`Order with razorpay_order_id ${razorpayOrderId} not found`);
        }
        order.status = order_entity_1.OrderStatus.SUCCESS;
        await this.orderRepository.save(order);
        this.logger.log(`Order marked as paid: ${razorpayOrderId}`);
    }
    async markOrderAsFailed(razorpayOrderId, errorDescription) {
        const order = await this.findOrderByRazorpayId(razorpayOrderId);
        if (!order) {
            throw new common_1.NotFoundException(`Order with razorpay_order_id ${razorpayOrderId} not found`);
        }
        order.status = order_entity_1.OrderStatus.FAILED;
        await this.orderRepository.save(order);
        this.logger.log(`Order marked as failed: ${razorpayOrderId}, Reason: ${errorDescription}`);
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = OrderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, common_1.Inject)('KAFKA_SERVICE')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        microservices_1.ClientKafka])
], OrderService);
//# sourceMappingURL=order.service.js.map