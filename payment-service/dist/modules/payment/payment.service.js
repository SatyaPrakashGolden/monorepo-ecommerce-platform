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
const Razorpay = require('razorpay');
let PaymentService = PaymentService_1 = class PaymentService {
    kafkaClient;
    paymentRepository;
    razorpay;
    logger = new common_1.Logger(PaymentService_1.name);
    constructor(kafkaClient, paymentRepository) {
        this.kafkaClient = kafkaClient;
        this.paymentRepository = paymentRepository;
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
    async createRazorpayOrder(createOrderDto) {
        const { total_amount, currency = 'INR', user_id, product_id, saga_id } = createOrderDto;
        if (!total_amount || total_amount < 1) {
            throw new common_1.BadRequestException('Amount must be at least 1 INR');
        }
        if (!user_id || !product_id) {
            throw new common_1.BadRequestException('Missing required fields: user_id or product_id');
        }
        const orderOptions = {
            amount: Math.round(total_amount * 100),
            currency,
            receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            notes: { saga_id },
        };
        try {
            const order = await this.razorpay.orders.create(orderOptions);
            this.logger.log(`Razorpay Order created successfully. ID: ${order.id}`);
            return {
                id: order.id,
                amount: order.amount / 100,
                currency: order.currency,
                receipt: order.receipt,
                status: order.status,
            };
        }
        catch (error) {
            this.logger.error(`Failed to create Razorpay order`, error.stack);
            throw new common_1.InternalServerErrorException('Something went wrong while creating the order');
        }
    }
    async handleRazorpayCallback(payload) {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, isFailedPayment } = payload;
        if (!razorpay_payment_id || !razorpay_order_id) {
            throw new common_1.BadRequestException('Missing required payment or order ID');
        }
        this.logger.log(`Payment callback received: payment_id=${razorpay_payment_id}, order_id=${razorpay_order_id}`);
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_secret) {
            throw new common_1.InternalServerErrorException('Razorpay key secret not configured');
        }
        const existingPayment = await this.paymentRepository.findOne({ where: { payment_id: razorpay_payment_id } });
        if (existingPayment) {
            this.logger.warn(`Payment already processed: payment_id=${razorpay_payment_id}`);
            return { success: false, message: 'Payment already processed', payment_id: razorpay_payment_id, order_id: razorpay_order_id };
        }
        if (isFailedPayment) {
            let payment;
            try {
                payment = await this.razorpay.payments.fetch(razorpay_payment_id);
            }
            catch (error) {
                this.logger.error(`Failed to fetch failed payment details: ${error.message}`);
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
            await this.paymentRepository.save(failedPaymentEntity);
            return {
                success: false,
                message: 'Payment failed',
                payment_id: payment.id,
                order_id: razorpay_order_id,
                error_description: payment.error_description || 'Payment was declined',
                status: payment.status,
            };
        }
        if (razorpay_signature) {
            const body = `${razorpay_order_id}|${razorpay_payment_id}`;
            const expectedSignature = crypto.createHmac('sha256', key_secret).update(body).digest('hex');
            if (expectedSignature !== razorpay_signature) {
                throw new common_1.BadRequestException('Invalid Razorpay signature');
            }
        }
        else {
            throw new common_1.BadRequestException('Missing Razorpay signature');
        }
        let payment;
        try {
            payment = await this.razorpay.payments.fetch(razorpay_payment_id);
        }
        catch (error) {
            this.logger.error(`Failed to fetch payment: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to fetch payment details');
        }
        if (payment.status !== 'captured') {
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
        await this.paymentRepository.save(paymentEntity);
        this.logger.log(`Payment verified and stored: ${razorpay_payment_id}`);
        return {
            success: true,
            message: 'Payment verified and saved successfully',
            payment_id: payment.id,
            order_id: razorpay_order_id,
        };
    }
    async verifyPayment(data) {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = data;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_secret) {
            throw new common_1.InternalServerErrorException('Razorpay key secret not configured');
        }
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto.createHmac('sha256', key_secret).update(body).digest('hex');
        if (expectedSignature === razorpay_signature) {
            return { success: true, message: 'Payment verified successfully' };
        }
        else {
            return { success: false, message: 'Invalid payment signature' };
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KAFKA_SERVICE')),
    __param(1, (0, typeorm_2.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [microservices_1.ClientKafka,
        typeorm_1.Repository])
], PaymentService);
//# sourceMappingURL=payment.service.js.map