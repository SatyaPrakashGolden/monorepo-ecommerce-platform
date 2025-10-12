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
const order_entity_2 = require("./entities/order.entity");
const saga_orchestrator_service_1 = require("../../shared/services/saga-orchestrator.service");
const saga_state_entity_1 = require("../../shared/entities/saga-state.entity");
const saga_logger_util_1 = require("../../shared/utils/saga-logger.util");
const uuid_1 = require("uuid");
let OrderService = OrderService_1 = class OrderService {
    orderRepository;
    kafkaClient;
    sagaOrchestrator;
    logger = new common_1.Logger(OrderService_1.name);
    sagaLogger = saga_logger_util_1.SagaLogger.getInstance();
    constructor(orderRepository, kafkaClient, sagaOrchestrator) {
        this.orderRepository = orderRepository;
        this.kafkaClient = kafkaClient;
        this.sagaOrchestrator = sagaOrchestrator;
    }
    async createOrder(createOrderDto) {
        try {
            const orderData = {
                ...createOrderDto,
                total_amount: Number(createOrderDto.total_amount),
                status: createOrderDto.status || order_entity_2.OrderStatus.PENDING,
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
            return await this.orderRepository.findOne({
                where: { razorpay_order_id: razorpayOrderId },
            });
        }
        catch (error) {
            this.logger.error(`Failed to find order by razorpay_order_id: ${razorpayOrderId}`, error.stack);
            return null;
        }
    }
    async findOrdersByUserId(userId) {
        try {
            return await this.orderRepository.find({
                where: { user_id: userId },
                order: { created_at: 'DESC' },
            });
        }
        catch (error) {
            this.logger.error(`Failed to find orders for user: ${userId}`, error.stack);
            throw new common_1.BadRequestException('Could not retrieve orders');
        }
    }
    async markOrderAsPaid(sagaId, razorpayOrderId, paymentId) {
        const order = await this.findOrderByRazorpayId(razorpayOrderId);
        if (!order) {
            this.logger.warn(`Order with Razorpay Order ID ${razorpayOrderId} not found`);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, null, 'Order not found for payment completion');
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.status === order_entity_2.OrderStatus.SUCCESS) {
            this.logger.warn(`Order ${order.id} is already marked as paid`);
            return order;
        }
        try {
            order.status = order_entity_2.OrderStatus.SUCCESS;
            order.payment_id = paymentId;
            const updatedOrder = await this.orderRepository.save(order);
            this.logger.log(`✅ Order marked as success: ${updatedOrder.id}`);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.COMPLETED, {
                orderId: updatedOrder.id,
                finalStatus: order_entity_2.OrderStatus.SUCCESS,
            });
            await this.kafkaClient.emit('order-completed', {
                sagaId,
                timestamp: Date.now(),
                correlationId: (0, uuid_1.v4)(),
                version: 1,
                type: 'ORDER_COMPLETED',
                payload: {
                    orderId: updatedOrder.id,
                    razorpayOrderId: updatedOrder.razorpay_order_id,
                    paymentId: paymentId,
                    userId: updatedOrder.user_id,
                    amount: updatedOrder.total_amount,
                    status: 'SUCCESS',
                },
            }).toPromise();
            this.sagaLogger.logSagaComplete(sagaId, 'completed');
            return updatedOrder;
        }
        catch (error) {
            this.sagaLogger.logSagaError(sagaId, error);
            this.logger.error(`Failed to mark order as paid: ${razorpayOrderId}`, error.stack);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, null, 'Failed to update order status to paid');
            throw new common_1.BadRequestException('Could not update order status');
        }
    }
    async markOrderAsFailed(sagaId, razorpayOrderId, reason) {
        const order = await this.findOrderByRazorpayId(razorpayOrderId);
        if (!order) {
            this.logger.warn(`Order with Razorpay Order ID ${razorpayOrderId} not found`);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, null, 'Order not found for failure marking');
            throw new common_1.NotFoundException('Order not found');
        }
        try {
            order.status = order_entity_2.OrderStatus.FAILED;
            const updatedOrder = await this.orderRepository.save(order);
            this.logger.log(`❌ Order marked as failed: ${updatedOrder.id}, Reason: ${reason || 'Unknown'}`);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, {
                orderId: updatedOrder.id,
                finalStatus: order_entity_2.OrderStatus.FAILED,
                failureReason: reason,
            }, reason);
            await this.kafkaClient.emit('order-failed', {
                sagaId,
                timestamp: Date.now(),
                correlationId: (0, uuid_1.v4)(),
                version: 1,
                type: 'ORDER_FAILED',
                payload: {
                    orderId: updatedOrder.id,
                    razorpayOrderId: updatedOrder.razorpay_order_id,
                    userId: updatedOrder.user_id,
                    amount: updatedOrder.total_amount,
                    reason: reason || 'Payment failed',
                    status: 'FAILED',
                },
            }).toPromise();
            return updatedOrder;
        }
        catch (error) {
            this.sagaLogger.logSagaError(sagaId, error);
            this.logger.error(`Failed to mark order as failed: ${razorpayOrderId}`, error.stack);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, null, 'Failed to update order status to failed');
            throw new common_1.BadRequestException('Could not update order status');
        }
    }
    async markOrderAsCancelled(sagaId, razorpayOrderId, reason) {
        const order = await this.findOrderByRazorpayId(razorpayOrderId);
        if (!order) {
            this.logger.warn(`Order with Razorpay Order ID ${razorpayOrderId} not found`);
            throw new common_1.NotFoundException('Order not found');
        }
        try {
            order.status = order_entity_2.OrderStatus.CANCELLED;
            const updatedOrder = await this.orderRepository.save(order);
            this.logger.log(`🚫 Order marked as cancelled: ${updatedOrder.id}, Reason: ${reason || 'User cancelled'}`);
            await this.kafkaClient.emit('order-payment-cancelled', {
                sagaId,
                timestamp: Date.now(),
                correlationId: (0, uuid_1.v4)(),
                version: 1,
                type: 'ORDER_CANCELLATION_REQUESTED',
                payload: {
                    orderId: updatedOrder.id,
                    userId: updatedOrder.user_id,
                    productId: updatedOrder.product_id,
                    amount: updatedOrder.total_amount,
                    razorpayOrderId: updatedOrder.razorpay_order_id,
                    reason: reason || 'Order cancelled',
                },
            }).toPromise();
            return updatedOrder;
        }
        catch (error) {
            this.sagaLogger.logSagaError(sagaId, error);
            this.logger.error(`Failed to mark order as cancelled: ${razorpayOrderId}`, error.stack);
            throw new common_1.BadRequestException('Could not update order status');
        }
    }
    async handleOrderCreated(event) {
        const { sagaId, payload } = event;
        try {
            this.logger.log(`Handling order creation for saga: ${sagaId}`);
            const createOrderDto = {
                user_id: payload.userId,
                product_id: payload.productId,
                total_amount: payload.amount,
                currency: payload.currency || 'INR',
                status: order_entity_2.OrderStatus.PENDING,
                razorpay_order_id: payload.razorpayOrderId,
                receipt: payload.receipt,
                razorpay_created_at: Date.now(),
            };
            const order = await this.createOrder(createOrderDto);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.ORDER_CREATED, {
                orderId: order.id,
                razorpayOrderId: order.razorpay_order_id,
            });
            this.logger.log(`Order created for saga ${sagaId}: ${order.id}`);
        }
        catch (error) {
            this.sagaLogger.logSagaError(sagaId, error);
            this.logger.error(`Failed to handle order creation for saga ${sagaId}:`, error);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, null, `Order creation failed: ${error.message}`);
        }
    }
    async handlePaymentVerified(event) {
        const { sagaId, payload } = event;
        try {
            this.logger.log(`Handling payment verification for saga: ${sagaId}`);
            await this.markOrderAsPaid(sagaId, payload.razorpayOrderId, payload.paymentId);
        }
        catch (error) {
            this.sagaLogger.logSagaError(sagaId, error);
            this.logger.error(`Failed to handle payment verification for saga ${sagaId}:`, error);
            await this.kafkaClient.emit('payment-reversal-requested', {
                sagaId,
                timestamp: Date.now(),
                correlationId: (0, uuid_1.v4)(),
                version: 1,
                type: 'PAYMENT_REVERSAL_REQUESTED',
                payload: {
                    razorpayPaymentId: payload.razorpayPaymentId,
                    razorpayOrderId: payload.razorpayOrderId,
                    amount: payload.amount,
                    reason: 'Order completion failed',
                },
            }).toPromise();
        }
    }
    async handlePaymentFailed(event) {
        const { sagaId, payload } = event;
        try {
            this.logger.log(`Handling payment failure for saga: ${sagaId}`);
            await this.markOrderAsFailed(sagaId, payload.razorpayOrderId, payload.errorDescription);
        }
        catch (error) {
            this.sagaLogger.logSagaError(sagaId, error);
            this.logger.error(`Failed to handle payment failure for saga ${sagaId}:`, error);
        }
    }
    async handleOrderCancellationRequest(event) {
        const { sagaId, payload } = event;
        try {
            this.logger.log(`Handling order cancellation request for saga: ${sagaId}`);
            await this.markOrderAsCancelled(sagaId, payload.razorpayOrderId, payload.reason);
        }
        catch (error) {
            this.sagaLogger.logSagaError(sagaId, error);
            this.logger.error(`Failed to handle order cancellation for saga ${sagaId}:`, error);
        }
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = OrderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, common_1.Inject)('KAFKA_SERVICE')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        microservices_1.ClientKafka,
        saga_orchestrator_service_1.SagaOrchestratorService])
], OrderService);
//# sourceMappingURL=order.service.js.map