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
const create_order_dto_1 = require("./dto/create-order.dto");
const payment_callback_dto_1 = require("./dto/payment-callback.dto");
const common_2 = require("@nestjs/common");
const user_middleware_1 = require("../../auth/user.middleware");
let PaymentController = PaymentController_1 = class PaymentController {
    paymentService;
    logger = new common_2.Logger(PaymentController_1.name);
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async createOrder(req, createOrderDto) {
        try {
            const userId = req.user.id;
            const orderWithUserId = {
                ...createOrderDto,
                user_id: userId
            };
            const order = await this.paymentService.createOrder(orderWithUserId);
            return {
                success: true,
                order,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create order', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async paymentCallback(body, res) {
        try {
            this.logger.log(`Received payment callback: ${JSON.stringify(body, null, 2)}`);
            let result;
            if (body?.error?.metadata) {
                let metadata;
                try {
                    metadata = JSON.parse(body.error.metadata);
                }
                catch (parseError) {
                    this.logger.error(`Failed to parse error metadata: ${parseError.message}`);
                    const failureRedirectUrl = process.env.FAILURE_REDIRECT_URL || 'http://localhost:3000/payment/failure';
                    return res.redirect(`${failureRedirectUrl}?error=${encodeURIComponent('Invalid metadata format')}`);
                }
                const { payment_id, user_id } = metadata;
                this.logger.log(`Processing failed payment: payment_id=${payment_id}, user_id=${user_id}`);
                result = await this.paymentService.handleRazorpayCallback({
                    razorpay_payment_id: payment_id,
                    razorpay_order_id: body.razorpay_order_id || '',
                    razorpay_signature: undefined,
                    isFailedPayment: true,
                });
                this.logger.error(`Payment failed: ${result.error_description || 'Unknown error'}`, {
                    payment_id: payment_id,
                    user_id: user_id,
                });
                const failureRedirectUrl = process.env.FAILURE_REDIRECT_URL || 'http://localhost:3000/payment/failure';
                return res.redirect(`${failureRedirectUrl}?error=${encodeURIComponent(result.error_description || 'Payment failed')}&user_id=${user_id}&payment_id=${payment_id}`);
            }
            else {
                const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;
                if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
                    throw new common_1.HttpException('Missing required payment parameters', common_1.HttpStatus.BAD_REQUEST);
                }
                result = await this.paymentService.handleRazorpayCallback({
                    razorpay_payment_id,
                    razorpay_order_id,
                    razorpay_signature,
                    isFailedPayment: false,
                });
                this.logger.log(`Payment callback processed successfully: ${JSON.stringify(result)}`);
                const successRedirectUrl = process.env.SUCCESS_REDIRECT_URL || 'http://localhost:3000/payment/success';
                return res.redirect(`${successRedirectUrl}?payment_id=${result.payment_id}&order_id=${result.order_id}`);
            }
        }
        catch (error) {
            this.logger.error(`Payment callback failed: ${error.message}`, error.stack);
            let userId = 'unknown';
            let orderId = 'unknown';
            if (body?.razorpay_order_id) {
                orderId = body.razorpay_order_id;
            }
            if (body?.error?.metadata) {
                try {
                    const metadata = JSON.parse(body.error.metadata);
                    userId = metadata.user_id || 'unknown';
                    orderId = metadata.order_id || orderId;
                }
                catch (parseError) {
                    this.logger.error(`Failed to parse error metadata: ${parseError.message}`);
                }
            }
            const failureRedirectUrl = process.env.FAILURE_REDIRECT_URL || 'http://localhost:3000/payment/failure';
            return res.redirect(`${failureRedirectUrl}?error=${encodeURIComponent(error.message || 'callback_error')}&user_id=${userId}&order_id=${orderId}`);
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
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map