// payment/payment.service.ts
import { Injectable, Logger, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientKafka } from '@nestjs/microservices';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { SagaOrchestratorService } from '../../shared/services/saga-orchestrator.service';
import { SagaStatus } from '../../shared/entities/saga-state.entity';
import { SagaLogger } from '../../shared/utils/saga-logger.util';
import { v4 as uuidv4 } from 'uuid';

const Razorpay = require('razorpay');

@Injectable()
export class PaymentService {
  private readonly razorpay: any;
  private readonly logger = new Logger(PaymentService.name);
  private readonly sagaLogger = SagaLogger.getInstance();

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    private readonly sagaOrchestrator: SagaOrchestratorService,
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

    // Start Saga
    const sagaId = await this.sagaOrchestrator.startOrderPaymentSaga({
      userId: user_id,
      productId: product_id,
      amount,
      currency,
    });

    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    };

    try {
      const order = await this.razorpay.orders.create(orderOptions);
      this.logger.log(`Razorpay Order created successfully. ID: ${order.id}`);

      // Update saga with order creation success
      await this.sagaOrchestrator.updateSagaStatus(sagaId, SagaStatus.ORDER_CREATED, {
        razorpayOrderId: order.id,
        receipt: order.receipt,
        razorpayCreatedAt: order.created_at,
      });

      // Emit order created event (orderId is 0 here; will be updated in order service)
      await this.kafkaClient.emit('order-created', {
        sagaId,
        timestamp: Date.now(),
        correlationId: uuidv4(),
        version: 1,
        type: 'ORDER_CREATED',
        payload: {
          orderId: 0, // Ignored and updated in order service
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
    } catch (error) {
      this.sagaLogger.logSagaError(sagaId, error);
      this.logger.error(`Failed to create Razorpay order`, error.stack);
      
      // Update saga with failure
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED, 
        null, 
        'Failed to create Razorpay order'
      );

      // Emit order creation failed event
      await this.kafkaClient.emit('order-creation-failed', {
        sagaId,
        timestamp: Date.now(),
        correlationId: uuidv4(),
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

      throw new InternalServerErrorException('Something went wrong while creating the order');
    }
  }

async handleRazorpayCallback(payload: PaymentCallbackDto) {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, isFailedPayment } = payload;

  if (!razorpay_payment_id || !razorpay_order_id) {
    throw new BadRequestException('Missing required payment or order ID');
  }

  // Find the saga associated with this order
  const sagaState = await this.sagaOrchestrator.findSagaByRazorpayOrderId(razorpay_order_id);
  if (!sagaState) {
    this.logger.error(`No saga found for order: ${razorpay_order_id}`);
    throw new BadRequestException('No associated transaction found');
  }

  await this.sagaOrchestrator.updateSagaStatus(
    sagaState.saga_id, 
    SagaStatus.PAYMENT_PROCESSING,
    {
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    }
  );

  // Emit payment processing started event
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
    return await this.handleFailedPayment(sagaState.saga_id, razorpay_payment_id, razorpay_order_id);
  }

  // For successful payment, ensure razorpay_signature is provided
  if (!razorpay_signature) {
    this.logger.error(`Missing razorpay_signature for successful payment: order_id=${razorpay_order_id}`);
    await this.sagaOrchestrator.updateSagaStatus(
      sagaState.saga_id, 
      SagaStatus.FAILED, 
      null, 
      'Missing Razorpay signature for successful payment'
    );
    throw new BadRequestException('Missing Razorpay signature for successful payment');
  }

  // Handle successful payment
  return await this.handleSuccessfulPayment(sagaState.saga_id, razorpay_payment_id, razorpay_order_id, razorpay_signature);
}

  private async handleFailedPayment(sagaId: string, razorpayPaymentId: string, razorpayOrderId: string) {
    this.logger.warn(`Processing failed payment: payment_id=${razorpayPaymentId}, order_id=${razorpayOrderId}`);
    
    let payment;
    try {
      payment = await this.razorpay.payments.fetch(razorpayPaymentId);
      this.logger.log(`Fetched failed payment details: payment_id=${razorpayPaymentId}`);
    } catch (error) {
      this.sagaLogger.logSagaError(sagaId, error);
      this.logger.error(`Failed to fetch failed payment details: ${error.message}`);
      
      // Update saga with error
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED, 
        null, 
        'Failed to fetch payment details'
      );
      
      throw new InternalServerErrorException('Failed to fetch payment details for failed payment');
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
      
      // Update saga status
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED, 
        {
          errorCode: payment.error_code,
          errorDescription: payment.error_description,
        }, 
        'Payment failed'
      );

      // Emit payment failed event
      await this.kafkaClient.emit('payment-failed', {
        sagaId,
        timestamp: Date.now(),
        correlationId: uuidv4(),
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
    } catch (saveError) {
      this.sagaLogger.logSagaError(sagaId, saveError);
      this.logger.error(`Failed to save failed payment: ${saveError.message}`);
      
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED, 
        null, 
        'Failed to save payment failure record'
      );
      
      throw new InternalServerErrorException('Failed to save payment failure record');
    }
  }

  private async handleSuccessfulPayment(
    sagaId: string, 
    razorpayPaymentId: string, 
    razorpayOrderId: string, 
    razorpaySignature: string
  ) {
    // Verify signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      this.logger.error('Razorpay key secret not configured');
      
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED, 
        null, 
        'Razorpay key secret not configured'
      );
      
      throw new InternalServerErrorException('Razorpay key secret not configured');
    }

    if (razorpaySignature) {
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto.createHmac('sha256', key_secret).update(body).digest('hex');

      if (expectedSignature !== razorpaySignature) {
        this.logger.warn(`Invalid Razorpay signature for payment_id=${razorpayPaymentId}`);
        
        await this.sagaOrchestrator.updateSagaStatus(
          sagaId, 
          SagaStatus.FAILED, 
          null, 
          'Invalid Razorpay signature'
        );
        
        throw new BadRequestException('Invalid Razorpay signature');
      }
    } else {
      this.logger.warn(`Missing Razorpay signature for order_id=${razorpayOrderId}`);
      
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED, 
        null, 
        'Missing Razorpay signature'
      );
      
      throw new BadRequestException('Missing Razorpay signature');
    }

    // Fetch payment details
    let payment;
    try {
      payment = await this.razorpay.payments.fetch(razorpayPaymentId);
    } catch (error) {
      this.sagaLogger.logSagaError(sagaId, error);
      this.logger.error(`Failed to fetch payment: ${error.message}`);
      
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED, 
        null, 
        'Failed to fetch payment details'
      );
      
      throw new InternalServerErrorException('Failed to fetch payment details');
    }

    if (payment.status !== 'captured') {
      this.logger.warn(`Payment not captured: ${razorpayPaymentId}`);
      
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED, 
        null, 
        'Payment is not captured'
      );
      
      throw new BadRequestException('Payment is not captured');
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
      
      // Update saga status
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.PAYMENT_VERIFIED,
        {
          paymentId: savedPayment.id,
          razorpayPaymentId: payment.id,
          amount: payment.amount / 100,
          status: payment.status,
        }
      );

      // Emit payment verified event
      await this.kafkaClient.emit('payment-verified', {
        sagaId,
        timestamp: Date.now(),
        correlationId: uuidv4(),
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
    } catch (saveError) {
      this.sagaLogger.logSagaError(sagaId, saveError);
      this.logger.error(`Failed to save successful payment: ${saveError.message}`);
      
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED, 
        null, 
        'Failed to save payment record'
      );
      
      throw new InternalServerErrorException('Failed to save payment record');
    }
  }

  async handlePaymentReversalRequest(event: any): Promise<void> {
    const { sagaId, payload } = event;
    const { razorpayPaymentId, amount, reason } = payload;

    try {
      this.logger.log(`Processing payment reversal: ${razorpayPaymentId}`);

      // Create refund through Razorpay
      const refund = await this.razorpay.payments.refund(razorpayPaymentId, {
        amount: Math.round(amount * 100), // Convert to paise
        reason: reason || 'requested_by_customer',
      });

      // Update payment record
      const payment = await this.paymentRepository.findOne({
        where: { payment_id: razorpayPaymentId },
      });

      if (payment) {
        payment.amount_refunded = refund.amount / 100;
        payment.refund_status = refund.status;
        await this.paymentRepository.save(payment);
      }

      // Emit payment reversed event
      await this.kafkaClient.emit('payment-reversed', {
        sagaId,
        timestamp: Date.now(),
        correlationId: uuidv4(),
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
    } catch (error) {
      this.sagaLogger.logSagaError(sagaId, error);
      this.logger.error(`Failed to reverse payment ${razorpayPaymentId}:`, error);
      
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED, 
        null, 
        `Payment reversal failed: ${error.message}`
      );
    }
  }
}