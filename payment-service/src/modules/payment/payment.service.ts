import { Injectable, Logger, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientKafka } from '@nestjs/microservices';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {PaymentCallbackDto} from './dto/payment-callback.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
const Razorpay = require('razorpay');

@Injectable()
export class PaymentService {
  private readonly razorpay: any;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
  ) {
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

async createOrder(createOrderDto: CreateOrderDto) {
  const { amount, currency = 'INR', user_id, product_id } = createOrderDto;

  // Validate required fields
  if (!amount || amount < 1) {
    throw new BadRequestException('Amount must be at least 1 INR');
  }

  if (!user_id || !product_id) {
    throw new BadRequestException('Missing required fields: user_id or product_id');
  }

  const orderOptions = {
    amount: Math.round(amount * 100), // Convert to paise
    currency,
    receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
  };

  try {
    const order = await this.razorpay.orders.create(orderOptions);
    this.logger.log(`Razorpay Order created successfully. ID: ${order.id}`);

    const orderEventPayload = {
      user_id,
      product_id,
      total_amount: (order.amount / 100).toFixed(2),
      currency: order.currency || 'INR',
      status: 'pending',
      razorpay_order_id: order.id || null,
      receipt: order.receipt || null,
      razorpay_created_at: order.created_at || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await this.kafkaClient.emit('payment-order-created', orderEventPayload).toPromise();

    return {
      id: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    };
  } catch (error) {
    this.logger.error(`Failed to create Razorpay order`, error.stack);
    throw new InternalServerErrorException('Something went wrong while creating the order');
  }
}

async handleRazorpayCallback(payload: PaymentCallbackDto) {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, isFailedPayment } = payload;

  if (!razorpay_payment_id || !razorpay_order_id) {
    throw new BadRequestException('Missing required payment or order ID');
  }

  this.logger.log(`Payment callback received: payment_id=${razorpay_payment_id}, order_id=${razorpay_order_id}`);

  // Use RAZORPAY_KEY_SECRET instead of WEBHOOK_SECRET for signature verification
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) {
    this.logger.error('Razorpay key secret not configured');
    throw new InternalServerErrorException('Razorpay key secret not configured');
  }

  // Check for existing payment to avoid duplicates
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

  // Handle failed payment
  if (isFailedPayment) {
    this.logger.warn(`Processing failed payment: payment_id=${razorpay_payment_id}, order_id=${razorpay_order_id}`);
    let payment;
    try {
      payment = await this.razorpay.payments.fetch(razorpay_payment_id);
      this.logger.log(`Fetched failed payment details: payment_id=${razorpay_payment_id}`);
    } catch (error) {
      this.logger.error(`Failed to fetch failed payment details: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch payment details for failed payment');
    }

    const failedPaymentEntity = this.paymentRepository.create({
      payment_id: payment.id,
      entity: payment.entity || 'payment',
      amount: payment.amount / 100, // Store in rupees
      currency: payment.currency || 'INR',
      status: payment.status,
      // Remove order_id field as it doesn't exist in Payment entity
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
      
      // Emit failure event to Kafka
      await this.kafkaClient.emit('payment-failed', {
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: payment.id,
        status: payment.status,
        amount: payment.amount / 100,
        error_code: payment.error_code,
        error_description: payment.error_description,
      }).toPromise();

      return {
        success: false,
        message: 'Payment failed',
        payment_id: payment.id,
        order_id: razorpay_order_id, // Use the order_id from payload
        error_description: payment.error_description || 'Payment was declined',
        status: payment.status,
      };
    } catch (saveError) {
      this.logger.error(`Failed to save failed payment: ${saveError.message}`);
      throw new InternalServerErrorException('Failed to save payment failure record');
    }
  }

  // Verify signature for successful payment
  if (razorpay_signature) {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', key_secret).update(body).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      this.logger.warn(`Invalid Razorpay signature for payment_id=${razorpay_payment_id}`);
      throw new BadRequestException('Invalid Razorpay signature');
    }
  } else {
    this.logger.warn(`Missing Razorpay signature for order_id=${razorpay_order_id}`);
    throw new BadRequestException('Missing Razorpay signature');
  }

  // Fetch payment details for successful payment
  let payment;
  try {
    payment = await this.razorpay.payments.fetch(razorpay_payment_id);
  } catch (error) {
    this.logger.error(`Failed to fetch payment: ${error.message}`);
    throw new InternalServerErrorException('Failed to fetch payment details');
  }

  if (payment.status !== 'captured') {
    this.logger.warn(`Payment not captured: ${razorpay_payment_id}`);
    throw new BadRequestException('Payment is not captured');
  }

  const paymentEntity = this.paymentRepository.create({
    payment_id: payment.id,
    entity: payment.entity || 'payment',
    amount: payment.amount / 100, // Store in rupees
    currency: payment.currency || 'INR',
    status: payment.status,
    // Remove order_id field as it doesn't exist in Payment entity
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
    await this.paymentRepository.save(paymentEntity);
    
    // Emit success event to Kafka
    await this.kafkaClient.emit('payment-verified', {
      razorpay_order_id: razorpay_order_id, // Use order_id from payload
      razorpay_payment_id: payment.id,
      status: payment.status,
      amount: payment.amount / 100,
    }).toPromise();

    this.logger.log(`Payment verified and stored: ${razorpay_payment_id}`);
    return {
      success: true,
      message: 'Payment verified and saved successfully',
      payment_id: payment.id,
      order_id: razorpay_order_id, // Use order_id from payload
    };
  } catch (saveError) {
    this.logger.error(`Failed to save successful payment: ${saveError.message}`);
    throw new InternalServerErrorException('Failed to save payment record');
  }
}
}