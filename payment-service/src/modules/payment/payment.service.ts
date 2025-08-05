import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices'; // Missing import
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly razorpay: Razorpay;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('payment.create.requested');
    this.kafkaClient.subscribeToResponseOf('payment.cancel.requested');
    await this.kafkaClient.connect();
  }

  verifySignature(payload: any, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');
    return signature === expectedSignature;
  }

  async processWebhook(webhookData: any): Promise<void> {
    try {
      const event = webhookData.event;
      const paymentData = webhookData.payload.payment.entity;
      const paymentId = paymentData.id;

      // Check for duplicate processing
      const existingPayment = await this.paymentRepository.findOne({ 
        where: { payment_id: paymentId } 
      });
      if (existingPayment) {
        this.logger.log(`Payment ${paymentId} already processed`);
        return;
      }

      const orderId = parseInt(paymentData.notes?.internalOrderId, 10);
      if (!orderId) {
        this.logger.warn('No internal order ID found in payment notes');
        return;
      }

      if (event === 'payment.captured') {
        await this.handlePaymentCaptured(paymentData, paymentId, orderId);
      } else if (event === 'payment.failed') {
        await this.handlePaymentFailed(paymentData, paymentId, orderId);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handlePaymentCaptured(paymentData: any, paymentId: string, orderId: number) {
    const payment = this.paymentRepository.create({
      payment_id: paymentId,
      order_id: paymentData.order_id,
      amount: paymentData.amount / 100,
      currency: paymentData.currency,
      status: paymentData.status,
      method: paymentData.method,
      captured: true,
      email: paymentData.email,
      contact: paymentData.contact,
      payment_created_at: paymentData.created_at,
      fee: paymentData.fee,
      tax: paymentData.tax,
    });
    
    await this.paymentRepository.save(payment);
    this.kafkaClient.emit('payment.captured', { orderId, paymentId });
    this.logger.log(`Payment ${paymentId} captured for order ${orderId}`);
  }

  private async handlePaymentFailed(paymentData: any, paymentId: string, orderId: number) {
    const payment = this.paymentRepository.create({
      payment_id: paymentId,
      order_id: paymentData.order_id,
      amount: paymentData.amount / 100,
      currency: paymentData.currency,
      status: paymentData.status,
      method: paymentData.method,
      captured: false,
      email: paymentData.email,
      contact: paymentData.contact,
      payment_created_at: paymentData.created_at,
      error_code: paymentData.error_code,
      error_description: paymentData.error_description,
      error_source: paymentData.error_source,
      error_step: paymentData.error_step,
      error_reason: paymentData.error_reason,
    });
    
    await this.paymentRepository.save(payment);
    this.kafkaClient.emit('payment.failed', { 
      orderId, 
      reason: paymentData.error_description,
      errorCode: paymentData.error_code 
    });
    this.logger.log(`Payment failed for order ${orderId}: ${paymentData.error_description}`);
  }

  @EventPattern('payment.create.requested')
  async createPayment(createPaymentDto: CreatePaymentDto) {
    try {
      // Use Razorpay order ID instead of custom generation
      const razorpayOrder = await this.razorpay.orders.create({
        amount: createPaymentDto.amount * 100, // Convert to paise
        currency: createPaymentDto.currency,
        notes: {
          internalOrderId: createPaymentDto.orderId.toString()
        }
      });

      const payment = this.paymentRepository.create({
        payment_id: razorpayOrder.id,
        order_id: razorpayOrder.id,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency,
        status: 'created',
        method: createPaymentDto.paymentMethod,
        email: createPaymentDto.email,
        contact: createPaymentDto.contact,
        payment_created_at: razorpayOrder.created_at,
      });
      
      await this.paymentRepository.save(payment);
      this.kafkaClient.emit('payment.created', { 
        orderId: createPaymentDto.orderId, 
        paymentId: razorpayOrder.id,
        razorpayOrderId: razorpayOrder.id
      });
      
      this.logger.log(`Payment ${razorpayOrder.id} created for order ${createPaymentDto.orderId}`);
      return { 
        paymentId: razorpayOrder.id, 
        orderId: createPaymentDto.orderId,
        razorpayOrderId: razorpayOrder.id
      };
    } catch (error) {
      this.logger.error(`Error creating payment: ${error.message}`, error.stack);
      throw error;
    }
  }

  @EventPattern('payment.cancel.requested')
  async cancelPayment(data: { orderId: number }) {
    try {
      const payment = await this.paymentRepository.findOne({ 
        where: { order_id: data.orderId.toString() } 
      });
      
      if (payment) {
        payment.status = 'cancelled';
        await this.paymentRepository.save(payment);
        this.kafkaClient.emit('payment.cancelled', { orderId: data.orderId });
        this.logger.log(`Payment for order ${data.orderId} cancelled`);
      } else {
        this.logger.warn(`Payment not found for order ${data.orderId}`);
      }
    } catch (error) {
      this.logger.error(`Error cancelling payment: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Additional utility methods
  async findPaymentByOrderId(orderId: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({ where: { order_id: orderId } });
  }

  async getPaymentStatus(paymentId: string): Promise<string | null> {
    const payment = await this.paymentRepository.findOne({ 
      where: { payment_id: paymentId } 
    });
    return payment?.status || null;
  }
}