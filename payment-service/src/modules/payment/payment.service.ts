// src/modules/payment/payment.service.ts
import { Injectable, Logger, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { ClientKafka } from '@nestjs/microservices';
import { CreatePaymentDto } from './dto/create-payment.dto'
import { Payment } from './entities/payment.entity';
const Razorpay = require('razorpay');
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class PaymentService {
  private readonly razorpay: any;
  private readonly logger = new Logger(PaymentService.name);


  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

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



  async createOrder({ amount, currency = 'INR' }: CreateOrderDto) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const orderOptions = {
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    };

    try {
      const order = await this.razorpay.orders.create(orderOptions);

      this.logger.log(`Razorpay Order created successfully. ID: ${order.id}`);

      // Prepare data to emit matching your Order entity structure
      const orderEventPayload = {
        user_id: 12,               // set user_id here if available from context/session
        seller_id: '67f668ee2bf992801aaee8ef',             // default null if not provided
        variant_id: '6800a866fbae064db11cf0a5',            // default null if not provided
        total_amount: (order.amount / 100).toFixed(2), // decimal as string, convert paise to rupees
        currency: order.currency || 'INR',
        status: 'pending',
        razorpay_order_id: order.id || null,
        receipt: order.receipt || null,
        razorpay_created_at: order.created_at || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.kafkaClient.emit('payment-order-created', orderEventPayload);

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





// async handleRazorpayCallback(payload: {
//   razorpay_payment_id?: string;
//   razorpay_order_id?: string;
//   razorpay_signature?: string;
//   isFailedPayment?: boolean; // Add this flag to distinguish failed payments
// }) {
//   const { razorpay_payment_id, razorpay_order_id, razorpay_signature, isFailedPayment } = payload;

//   this.logger.log(`Payment callback received: payment_id=${razorpay_payment_id}, order_id=${razorpay_order_id}`);

//   const key_secret = process.env.RAZORPAY_KEY_SECRET;
//   if (!key_secret) {
//     this.logger.error('Razorpay key secret not configured');
//     throw new InternalServerErrorException('Razorpay key secret not configured');
//   }

//   // Handle failed payment case
//   if (isFailedPayment) {
//     this.logger.warn(`⚠️ Processing failed payment: payment_id=${razorpay_payment_id}, order_id=${razorpay_order_id}`);
    
//     // Fetch payment details to get failure reason
//     let payment;

//     try {
//       payment = await this.razorpay.payments.fetch(razorpay_payment_id);
//       console.log('----------payment failded data to save databe--->',payment)
   
//     } catch (error) {
//            {}
//     }


//     return {
//       success: false,
//       message: 'Payment failed',
//       payment_id: payment.id,
//       order_id: payment.order_id,
//       error_description: payment.error_description || 'Payment was declined',
//       status: payment.status
//     };
//   }

//   // Handle successful payment case
//   if (razorpay_signature) {
//     const body = `${razorpay_order_id}|${razorpay_payment_id}`;
//     const expectedSignature = crypto
//       .createHmac('sha256', key_secret)
//       .update(body)
//       .digest('hex');

//     const isAuthentic = expectedSignature === razorpay_signature;

//     if (!isAuthentic) {
//       let paymentDetails = {};

//       try {
//         paymentDetails = await this.razorpay.payments.fetch(razorpay_payment_id);
//         console.log('⚠️ Signature mismatch. Fetched payment sucess data:', paymentDetails);
//       } catch (error) {
//         this.logger.warn(`Could not fetch payment on signature failure: ${error.message}`);
//       }

//       throw new BadRequestException('Invalid Razorpay signature');
//     }
//   } else {
//     // No signature means it's a failed payment case
//     this.logger.warn(`⚠️ Razorpay callback received without signature. Possibly a failed payment for order_id=${razorpay_order_id}`);
//   }

//   // Fetch payment details
//   let payment;
//   try {
//     payment = await this.razorpay.payments.fetch(razorpay_payment_id);
//   } catch (error) {
//     this.logger.error(`Failed to fetch payment: ${error.message}`);
//     throw new InternalServerErrorException('Failed to fetch payment details');
//   }

//   // If not captured, don't proceed (only for successful payments)
//   if (payment.status !== 'captured') {
//     this.logger.warn(`Payment not captured: ${razorpay_payment_id}`);
//     throw new BadRequestException('Payment is not captured');
//   }

//   console.log('✅ Payment fetched sfter sucess:', payment);

//   this.logger.log(`✅ Payment verified and stored: ${razorpay_payment_id}`);


//   return {
//     success: true,
//     message: 'Payment verified and saved successfully',
//     payment_id: payment.id,
//     order_id: payment.order_id,
//   };
// }



 async handleRazorpayCallback(payload: {
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    isFailedPayment?: boolean;
  }) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, isFailedPayment } = payload;

    this.logger.log(`Payment callback received: payment_id=${razorpay_payment_id}, order_id=${razorpay_order_id}`);

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      this.logger.error('Razorpay key secret not configured');
      throw new InternalServerErrorException('Razorpay key secret not configured');
    }

    // Handle failed payment case
    if (isFailedPayment) {
      this.logger.warn(`⚠️ Processing failed payment: payment_id=${razorpay_payment_id}, order_id=${razorpay_order_id}`);

      let payment;
      try {
        payment = await this.razorpay.payments.fetch(razorpay_payment_id);
        console.log('----------payment failed data to save database--->', payment);
      } catch (error) {
        this.logger.error(`Failed to fetch failed payment details: ${error.message}`);
        throw new InternalServerErrorException('Failed to fetch payment details for failed payment');
      }

      // Save failed payment data to DB
      const failedPaymentEntity = this.paymentRepository.create({
        payment_id: payment.id,
        entity: payment.entity,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        order_id: payment.order_id,
        invoice_id: payment.invoice_id,
        international: payment.international,
        method: payment.method,
        amount_refunded: payment.amount_refunded,
        refund_status: payment.refund_status,
        captured: payment.captured,
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
        payment_created_at: payment.created_at,
      });

      await this.paymentRepository.save(failedPaymentEntity);

      return {
        success: false,
        message: 'Payment failed',
        payment_id: payment.id,
        order_id: payment.order_id,
        error_description: payment.error_description || 'Payment was declined',
        status: payment.status,
      };
    }

    // Handle successful payment case
    if (razorpay_signature) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto.createHmac('sha256', key_secret).update(body).digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        let paymentDetails = {};
        try {
          paymentDetails = await this.razorpay.payments.fetch(razorpay_payment_id);
          console.log('⚠️ Signature mismatch. Fetched payment success data:', paymentDetails);
        } catch (error) {
          this.logger.warn(`Could not fetch payment on signature failure: ${error.message}`);
        }
        throw new BadRequestException('Invalid Razorpay signature');
      }
    } else {
      // No signature means possibly a failed payment case
      this.logger.warn(`⚠️ Razorpay callback received without signature. Possibly a failed payment for order_id=${razorpay_order_id}`);
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

    // Only proceed if payment is captured
    if (payment.status !== 'captured') {
      this.logger.warn(`Payment not captured: ${razorpay_payment_id}`);
      throw new BadRequestException('Payment is not captured');
    }

    console.log('✅ Payment fetched after success:', payment);

    // Save successful payment to DB
    const paymentEntity = this.paymentRepository.create({
      payment_id: payment.id,
      entity: payment.entity,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      order_id: payment.order_id,
      invoice_id: payment.invoice_id,
      international: payment.international,
      method: payment.method,
      amount_refunded: payment.amount_refunded,
      refund_status: payment.refund_status,
      captured: payment.captured,
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
      payment_created_at: payment.created_at,
    });

    await this.paymentRepository.save(paymentEntity);
  await this.kafkaClient.emit('verify-payment', {
    razorpay_order_id: payment.order_id,
  });
    this.logger.log(`✅ Payment verified and stored: ${razorpay_payment_id}`);

    return {
      success: true,
      message: 'Payment verified and saved successfully',
      payment_id: payment.id,
      order_id: payment.order_id,
    };
  }




}