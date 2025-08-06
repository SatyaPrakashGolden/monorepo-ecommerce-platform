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
let PaymentController = PaymentController_1 = class PaymentController {
    paymentService;
    logger = new common_2.Logger(PaymentController_1.name);
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async createOrder(createOrderDto) {
        try {
            const order = await this.paymentService.createOrder(createOrderDto);
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
                const metadata = JSON.parse(body.error.metadata);
                const { payment_id, order_id } = metadata;
                this.logger.log(`Processing failed payment: payment_id=${payment_id}, order_id=${order_id}`);
                result = await this.paymentService.handleRazorpayCallback({
                    razorpay_payment_id: payment_id,
                    razorpay_order_id: order_id,
                    razorpay_signature: '',
                    isFailedPayment: true,
                });
                const failureRedirectUrl = process.env.FAILURE_REDIRECT_URL || 'http://localhost:3000/payment/failure';
                return res.redirect(`${failureRedirectUrl}?error=${encodeURIComponent(result.error_description || 'Payment failed')}&order_id=${result.order_id}&payment_id=${result.payment_id}`);
            }
            else {
                const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;
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
            let orderId = 'unknown';
            if (body?.razorpay_order_id) {
                orderId = body.razorpay_order_id;
            }
            else if (body?.error?.metadata) {
                try {
                    const metadata = JSON.parse(body.error.metadata);
                    orderId = metadata.order_id;
                }
                catch (parseError) {
                    this.logger.error(`Failed to parse error metadata: ${parseError.message}`);
                }
            }
            const failureRedirectUrl = process.env.FAILURE_REDIRECT_URL || 'http://localhost:3000/payment/failure';
            return res.redirect(`${failureRedirectUrl}?error=${encodeURIComponent(error.message || 'callback_error')}&order_id=${orderId}`);
        }
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('order'),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto]),
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