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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const microservices_1 = require("@nestjs/microservices");
const payment_entity_1 = require("./entities/payment.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const saga_orchestrator_service_1 = require("../../shared/services/saga-orchestrator.service");
const saga_state_entity_1 = require("../../shared/entities/saga-state.entity");
const saga_logger_util_1 = require("../../shared/utils/saga-logger.util");
const uuid_1 = require("uuid");
const Razorpay = require('razorpay');
let PaymentService = PaymentService_1 = class PaymentService {
    kafkaClient;
    paymentRepository;
    sagaOrchestrator;
    razorpay;
    logger = new common_1.Logger(PaymentService_1.name);
    sagaLogger = saga_logger_util_1.SagaLogger.getInstance();
    constructor(kafkaClient, paymentRepository, sagaOrchestrator) {
        this.kafkaClient = kafkaClient;
        this.paymentRepository = paymentRepository;
        this.sagaOrchestrator = sagaOrchestrator;
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) {
            throw new Error('Razorpay credentials are missing');
        }
        this.razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
    }
    async createOrder(createOrderDto) {
        const { amount, currency = 'INR', user_id, product_id } = createOrderDto;
        if (!amount || amount < 1) {
            throw new common_1.BadRequestException('Amount must be at least 1 INR');
        }
        if (!user_id || !product_id) {
            throw new common_1.BadRequestException('Missing required fields: user_id or product_id');
        }
        const sagaId = await this.sagaOrchestrator.startOrderPaymentSaga({
            userId: user_id,
            productId: product_id,
            amount,
            currency,
        });
        const orderOptions = {
            amount: Math.round(amount * 100),
            currency,
            receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        };
        try {
            const order = await this.razorpay.orders.create(orderOptions);
            this.logger.log(`Razorpay Order created successfully. ID: ${order.id}`);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.ORDER_CREATED, {
                razorpayOrderId: order.id,
                receipt: order.receipt,
                razorpayCreatedAt: order.created_at,
            });
            await this.kafkaClient.emit('order-created', {
                sagaId,
                timestamp: Date.now(),
                correlationId: (0, uuid_1.v4)(),
                version: 1,
                type: 'ORDER_CREATED',
                payload: {
                    orderId: 0,
                    razorpayOrderId: order.id,
                    userId: user_id,
                    productId: product_id,
                    amount: order.amount / 100,
                    currency: order.currency,
                    receipt: order.receipt,
                },
            }).toPromise();
            return {
                id: order.id,
                amount: order.amount / 100,
                currency: order.currency,
                receipt: order.receipt,
                status: order.status,
                sagaId,
            };
        }
        catch (error) {
            this.sagaLogger.logSagaError(sagaId, error);
            this.logger.error(`Failed to create Razorpay order`, error.stack);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, null, 'Failed to create Razorpay order');
            await this.kafkaClient.emit('order-creation-failed', {
                sagaId,
                timestamp: Date.now(),
                correlationId: (0, uuid_1.v4)(),
                version: 1,
                type: 'ORDER_CREATION_FAILED',
                payload: {
                    userId: user_id,
                    productId: product_id,
                    amount,
                    reason: 'Failed to create Razorpay order',
                    error: error.message,
                },
            }).toPromise();
            throw new common_1.InternalServerErrorException('Something went wrong while creating the order');
        }
    }
    async handleRazorpayCallback(payload) {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, isFailedPayment } = payload;
        if (!razorpay_payment_id || !razorpay_order_id) {
            throw new common_1.BadRequestException('Missing required payment or order ID');
        }
        const sagaState = await this.sagaOrchestrator.findSagaByRazorpayOrderId(razorpay_order_id);
        if (!sagaState) {
            this.logger.error(`No saga found for order: ${razorpay_order_id}`);
            throw new common_1.BadRequestException('No associated transaction found');
        }
        await this.sagaOrchestrator.updateSagaStatus(sagaState.saga_id, saga_state_entity_1.SagaStatus.PAYMENT_PROCESSING, {
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
        });
        await this.kafkaClient.emit('payment-processing-started', {
            sagaId: sagaState.saga_id,
            timestamp: Date.now(),
            correlationId: sagaState.correlation_id,
            version: 1,
            type: 'PAYMENT_PROCESSING_STARTED',
            payload: {
                razorpayPaymentId: razorpay_payment_id,
                razorpayOrderId: razorpay_order_id,
                razorpaySignature: razorpay_signature,
                isFailedPayment,
            },
        }).toPromise();
        this.logger.log(`Payment callback received: payment_id=${razorpay_payment_id}, order_id=${razorpay_order_id}`);
        const existingPayment = await this.paymentRepository.findOne({
            where: { payment_id: razorpay_payment_id }
        });
        if (existingPayment) {
            this.logger.warn(`Payment already processed: payment_id=${razorpay_payment_id}`);
            return {
                success: false,
                message: 'Payment already processed',
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id,
            };
        }
        if (isFailedPayment) {
            return await this.handleFailedPayment(sagaState.saga_id, razorpay_payment_id, razorpay_order_id);
        }
        if (!razorpay_signature) {
            this.logger.error(`Missing razorpay_signature for successful payment: order_id=${razorpay_order_id}`);
            await this.sagaOrchestrator.updateSagaStatus(sagaState.saga_id, saga_state_entity_1.SagaStatus.FAILED, null, 'Missing Razorpay signature for successful payment');
            throw new common_1.BadRequestException('Missing Razorpay signature for successful payment');
        }
        return await this.handleSuccessfulPayment(sagaState.saga_id, razorpay_payment_id, razorpay_order_id, razorpay_signature);
    }
    async handleFailedPayment(sagaId, razorpayPaymentId, razorpayOrderId) {
        this.logger.warn(`Processing failed payment: payment_id=${razorpayPaymentId}, order_id=${razorpayOrderId}`);
        let payment;
        try {
            payment = await this.razorpay.payments.fetch(razorpayPaymentId);
            this.logger.log(`Fetched failed payment details: payment_id=${razorpayPaymentId}`);
        }
        catch (error) {
            this.sagaLogger.logSagaError(sagaId, error);
            this.logger.error(`Failed to fetch failed payment details: ${error.message}`);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, null, 'Failed to fetch payment details');
            throw new common_1.InternalServerErrorException('Failed to fetch payment details for failed payment');
        }
        const failedPaymentEntity = this.paymentRepository.create({
            payment_id: payment.id,
            entity: payment.entity || 'payment',
            amount: payment.amount / 100,
            currency: payment.currency || 'INR',
            status: payment.status,
            invoice_id: payment.invoice_id,
            international: payment.international || false,
            method: payment.method || 'unknown',
            amount_refunded: payment.amount_refunded || 0,
            refund_status: payment.refund_status,
            captured: payment.captured || false,
            description: payment.description,
            card_id: payment.card_id,
            bank: payment.bank,
            wallet: payment.wallet,
            vpa: payment.vpa,
            email: payment.email,
            contact: payment.contact,
            fee: payment.fee,
            tax: payment.tax,
            error_code: payment.error_code,
            error_description: payment.error_description,
            error_source: payment.error_source,
            error_step: payment.error_step,
            error_reason: payment.error_reason,
            bank_transaction_id: payment.acquirer_data?.bank_transaction_id || null,
            payment_created_at: payment.created_at || 0,
        });
        try {
            await this.paymentRepository.save(failedPaymentEntity);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, {
                errorCode: payment.error_code,
                errorDescription: payment.error_description,
            }, 'Payment failed');
            await this.kafkaClient.emit('payment-failed', {
                sagaId,
                timestamp: Date.now(),
                correlationId: (0, uuid_1.v4)(),
                version: 1,
                type: 'PAYMENT_FAILED',
                payload: {
                    razorpayPaymentId: payment.id,
                    razorpayOrderId: razorpayOrderId,
                    amount: payment.amount / 100,
                    errorCode: payment.error_code,
                    errorDescription: payment.error_description,
                    status: payment.status,
                },
            }).toPromise();
            return {
                success: false,
                message: 'Payment failed',
                payment_id: payment.id,
                order_id: razorpayOrderId,
                error_description: payment.error_description || 'Payment was declined',
                status: payment.status,
                sagaId,
            };
        }
        catch (saveError) {
            this.sagaLogger.logSagaError(sagaId, saveError);
            this.logger.error(`Failed to save failed payment: ${saveError.message}`);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, null, 'Failed to save payment failure record');
            throw new common_1.InternalServerErrorException('Failed to save payment failure record');
        }
    }
    async handleSuccessfulPayment(sagaId, razorpayPaymentId, razorpayOrderId, razorpaySignature) {
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_secret) {
            this.logger.error('Razorpay key secret not configured');
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, null, 'Razorpay key secret not configured');
            throw new common_1.InternalServerErrorException('Razorpay key secret not configured');
        }
        if (razorpaySignature) {
            const body = `${razorpayOrderId}|${razorpayPaymentId}`;
            const expectedSignature = crypto.createHmac('sha256', key_secret).update(body).digest('hex');
            if (expectedSignature !== razorpaySignature) {
                this.logger.warn(`Invalid Razorpay signature for payment_id=${razorpayPaymentId}`);
                await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, null, 'Invalid Razorpay signature');
                throw new common_1.BadRequestException('Invalid Razorpay signature');
            }
        }
        else {
            this.logger.warn(`Missing Razorpay signature for order_id=${razorpayOrderId}`);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, null, 'Missing Razorpay signature');
            throw new common_1.BadRequestException('Missing Razorpay signature');
        }
        let payment;
        try {
            payment = await this.razorpay.payments.fetch(razorpayPaymentId);
        }
        catch (error) {
            this.sagaLogger.logSagaError(sagaId, error);
            this.logger.error(`Failed to fetch payment: ${error.message}`);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, null, 'Failed to fetch payment details');
            throw new common_1.InternalServerErrorException('Failed to fetch payment details');
        }
        if (payment.status !== 'captured') {
            this.logger.warn(`Payment not captured: ${razorpayPaymentId}`);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, null, 'Payment is not captured');
            throw new common_1.BadRequestException('Payment is not captured');
        }
        const paymentEntity = this.paymentRepository.create({
            payment_id: payment.id,
            entity: payment.entity || 'payment',
            amount: payment.amount / 100,
            currency: payment.currency || 'INR',
            status: payment.status,
            invoice_id: payment.invoice_id,
            international: payment.international || false,
            method: payment.method || 'unknown',
            amount_refunded: payment.amount_refunded || 0,
            refund_status: payment.refund_status,
            captured: payment.captured || false,
            description: payment.description,
            card_id: payment.card_id,
            bank: payment.bank,
            wallet: payment.wallet,
            vpa: payment.vpa,
            email: payment.email,
            contact: payment.contact,
            fee: payment.fee,
            tax: payment.tax,
            error_code: payment.error_code,
            error_description: payment.error_description,
            error_source: payment.error_source,
            error_step: payment.error_step,
            error_reason: payment.error_reason,
            bank_transaction_id: payment.acquirer_data?.bank_transaction_id || null,
            payment_created_at: payment.created_at || 0,
        });
        try {
            const savedPayment = await this.paymentRepository.save(paymentEntity);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.PAYMENT_VERIFIED, {
                paymentId: savedPayment.id,
                razorpayPaymentId: payment.id,
                amount: payment.amount / 100,
                status: payment.status,
            });
            await this.kafkaClient.emit('payment-verified', {
                sagaId,
                timestamp: Date.now(),
                correlationId: (0, uuid_1.v4)(),
                version: 1,
                type: 'PAYMENT_VERIFIED',
                payload: {
                    paymentId: savedPayment.id,
                    razorpayPaymentId: payment.id,
                    razorpayOrderId: razorpayOrderId,
                    amount: payment.amount / 100,
                    status: payment.status,
                },
            }).toPromise();
            this.logger.log(`Payment verified and stored: ${razorpayPaymentId}`);
            return {
                success: true,
                message: 'Payment verified and saved successfully',
                payment_id: payment.id,
                order_id: razorpayOrderId,
                sagaId,
            };
        }
        catch (saveError) {
            this.sagaLogger.logSagaError(sagaId, saveError);
            this.logger.error(`Failed to save successful payment: ${saveError.message}`);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, null, 'Failed to save payment record');
            throw new common_1.InternalServerErrorException('Failed to save payment record');
        }
    }
    async handlePaymentReversalRequest(event) {
        const { sagaId, payload } = event;
        const { razorpayPaymentId, amount, reason } = payload;
        try {
            this.logger.log(`Processing payment reversal: ${razorpayPaymentId}`);
            const refund = await this.razorpay.payments.refund(razorpayPaymentId, {
                amount: Math.round(amount * 100),
                reason: reason || 'requested_by_customer',
            });
            const payment = await this.paymentRepository.findOne({
                where: { payment_id: razorpayPaymentId },
            });
            if (payment) {
                payment.amount_refunded = refund.amount / 100;
                payment.refund_status = refund.status;
                await this.paymentRepository.save(payment);
            }
            await this.kafkaClient.emit('payment-reversed', {
                sagaId,
                timestamp: Date.now(),
                correlationId: (0, uuid_1.v4)(),
                version: 1,
                type: 'PAYMENT_REVERSED',
                payload: {
                    razorpayPaymentId,
                    razorpayOrderId: payload.razorpayOrderId,
                    refundId: refund.id,
                    amount: refund.amount / 100,
                    status: refund.status,
                },
            }).toPromise();
            this.logger.log(`Payment reversed successfully: ${razorpayPaymentId}`);
        }
        catch (error) {
            this.sagaLogger.logSagaError(sagaId, error);
            this.logger.error(`Failed to reverse payment ${razorpayPaymentId}:`, error);
            await this.sagaOrchestrator.updateSagaStatus(sagaId, saga_state_entity_1.SagaStatus.FAILED, null, `Payment reversal failed: ${error.message}`);
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KAFKA_SERVICE')),
    __param(1, (0, typeorm_2.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [microservices_1.ClientKafka,
        typeorm_1.Repository,
        saga_orchestrator_service_1.SagaOrchestratorService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map