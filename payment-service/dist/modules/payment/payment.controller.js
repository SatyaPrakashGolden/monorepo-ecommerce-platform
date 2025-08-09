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
var PaymentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const payment_saga_orchestrator_service_1 = require("./payment-saga-orchestrator.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const payment_callback_dto_1 = require("./dto/payment-callback.dto");
const common_2 = require("@nestjs/common");
const user_middleware_1 = require("../../auth/user.middleware");
let PaymentController = PaymentController_1 = class PaymentController {
    paymentService;
    sagaOrchestrator;
    logger = new common_2.Logger(PaymentController_1.name);
    constructor(paymentService, sagaOrchestrator) {
        this.paymentService = paymentService;
        this.sagaOrchestrator = sagaOrchestrator;
    }
    async createOrder(req, createOrderDto) {
        try {
            const userId = req.user.id;
            const checkoutData = createOrderDto.checkout_data;
            if (!checkoutData || !checkoutData.cartItems || !checkoutData.total) {
                throw new common_1.HttpException('Checkout data, cart items, or total amount missing', common_1.HttpStatus.BAD_REQUEST);
            }
            const productIds = checkoutData.cartItems.map(item => item.productId).join(',');
            const sagaId = await this.sagaOrchestrator.startPaymentSaga({
                user_id: userId,
                cart_items: checkoutData.cartItems,
                total_amount: checkoutData.total,
                currency: 'INR',
            });
            const razorpayOrder = await this.paymentService.createRazorpayOrder({
                total_amount: checkoutData.total,
                currency: 'INR',
                user_id: userId,
                product_id: productIds,
                saga_id: sagaId,
            });
            const saga = await this.sagaOrchestrator['sagaRepository'].findOne({
                where: { saga_id: sagaId }
            });
            if (saga) {
                saga.razorpay_order_id = razorpayOrder.id;
                saga.context = {
                    ...saga.context,
                    razorpay_order: razorpayOrder
                };
                await this.sagaOrchestrator['sagaRepository'].save(saga);
            }
            return {
                success: true,
                saga_id: sagaId,
                message: 'Payment process started',
                order: {
                    id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    receipt: razorpayOrder.receipt,
                    status: razorpayOrder.status,
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to create order: ${error.message}`, error.stack);
            throw new common_1.HttpException(error.message || 'Failed to start payment process', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async paymentCallback(body, res) {
        try {
            this.logger.log(`Received payment callback: ${JSON.stringify(body, null, 2)}`);
            if (body?.error?.metadata) {
                const metadata = JSON.parse(body.error.metadata);
                await this.paymentService.kafkaClient.emit('saga.payment.failed', {
                    saga_id: metadata.saga_id,
                    payment_id: metadata.payment_id,
                    user_id: metadata.user_id,
                    error: body.error,
                });
                const failureRedirectUrl = process.env.FAILURE_REDIRECT_URL || 'http://localhost:3000/payment/failure';
                const errorDescription = body.error.description || 'Unknown error';
                return res.redirect(`${failureRedirectUrl}?error=${encodeURIComponent(errorDescription)}`);
            }
            else {
                if (!body.razorpay_payment_id || !body.razorpay_order_id || !body.razorpay_signature) {
                    throw new Error('Missing required payment fields: payment_id, order_id, or signature');
                }
                const verificationResult = await this.paymentService.verifyPayment({
                    razorpay_payment_id: body.razorpay_payment_id,
                    razorpay_order_id: body.razorpay_order_id,
                    razorpay_signature: body.razorpay_signature,
                });
                if (!verificationResult.success) {
                    throw new Error('Payment verification failed');
                }
                const saga = await this.sagaOrchestrator['sagaRepository'].findOne({
                    where: { razorpay_order_id: body.razorpay_order_id }
                });
                if (!saga) {
                    throw new Error('Associated saga not found for this payment');
                }
                saga.payment_id = body.razorpay_payment_id;
                await this.sagaOrchestrator['sagaRepository'].save(saga);
                await this.paymentService.kafkaClient.emit('saga.payment.success', {
                    saga_id: saga.saga_id,
                    payment_id: body.razorpay_payment_id,
                    order_id: body.razorpay_order_id,
                    signature: body.razorpay_signature,
                });
                const successRedirectUrl = process.env.SUCCESS_REDIRECT_URL || 'http://localhost:3000/payment/success';
                return res.redirect(`${successRedirectUrl}?payment_id=${body.razorpay_payment_id}&order_id=${body.razorpay_order_id}`);
            }
        }
        catch (error) {
            this.logger.error(`Payment callback failed: ${error.message}`, error.stack);
            const failureRedirectUrl = process.env.FAILURE_REDIRECT_URL || 'http://localhost:3000/payment/failure';
            return res.redirect(`${failureRedirectUrl}?error=${encodeURIComponent('callback_error')}`);
        }
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('order'),
    (0, common_1.UseGuards)(user_middleware_1.UserAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('callback'),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_callback_dto_1.PaymentCallbackDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "paymentCallback", null);
exports.PaymentController = PaymentController = PaymentController_1 = __decorate([
    (0, common_1.Controller)('payment'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService,
        payment_saga_orchestrator_service_1.PaymentSagaOrchestrator])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map