import { Controller, Post, Body, HttpException, HttpStatus, ValidationPipe, Res, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { PaymentSagaOrchestrator } from './payment-saga-orchestrator.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { Logger } from '@nestjs/common';
import { UserAuthGuard } from '../../auth/user.middleware';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly sagaOrchestrator: PaymentSagaOrchestrator,
  ) { }

  @Post('order')
  @UseGuards(UserAuthGuard)
  async createOrder(
    @Request() req,
    @Body(ValidationPipe) createOrderDto: CreateOrderDto,
  ) {
    try {
      const userId = req.user.id;
      const checkoutData = createOrderDto.checkout_data;

      if (!checkoutData || !checkoutData.cartItems || !checkoutData.total) {
        throw new HttpException(
          'Checkout data, cart items, or total amount missing',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Extract product_id from cart items
      const productIds = checkoutData.cartItems.map(item => item.productId).join(',');

      // 1. Start the saga first
      const sagaId = await this.sagaOrchestrator.startPaymentSaga({
        user_id: userId,
        cart_items: checkoutData.cartItems,
        total_amount: checkoutData.total,
        currency: 'INR',
      });

      // 2. Create Razorpay order immediately
      const razorpayOrder = await this.paymentService.createRazorpayOrder({
        total_amount: checkoutData.total,
        currency: 'INR',
        user_id: userId,
        product_id: productIds,
        saga_id: sagaId, // Link the order to the saga
      });

      // 3. Update the saga with the razorpay_order_id
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

      // 4. Return the expected response format
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
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Failed to start payment process',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('callback')
  async paymentCallback(
    @Body(ValidationPipe) body: PaymentCallbackDto,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(`Received payment callback: ${JSON.stringify(body, null, 2)}`);

      // Handle payment failure
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
      // Handle payment success
      else {
        // Validate required fields for success case
        if (!body.razorpay_payment_id || !body.razorpay_order_id || !body.razorpay_signature) {
          throw new Error('Missing required payment fields: payment_id, order_id, or signature');
        }

        // First verify the payment - now TypeScript knows these are strings
        const verificationResult = await this.paymentService.verifyPayment({
          razorpay_payment_id: body.razorpay_payment_id,
          razorpay_order_id: body.razorpay_order_id,
          razorpay_signature: body.razorpay_signature,
        });

        if (!verificationResult.success) {
          throw new Error('Payment verification failed');
        }

        // Find saga by razorpay_order_id
        const saga = await this.sagaOrchestrator['sagaRepository'].findOne({
          where: { razorpay_order_id: body.razorpay_order_id }
        });

        if (!saga) {
          throw new Error('Associated saga not found for this payment');
        }

        // Update saga with payment details
        saga.payment_id = body.razorpay_payment_id;
        await this.sagaOrchestrator['sagaRepository'].save(saga);

        // Emit success event to continue saga
        await this.paymentService.kafkaClient.emit('saga.payment.success', {
          saga_id: saga.saga_id,
          payment_id: body.razorpay_payment_id,
          order_id: body.razorpay_order_id,
          signature: body.razorpay_signature,
        });

        const successRedirectUrl = process.env.SUCCESS_REDIRECT_URL || 'http://localhost:3000/payment/success';
        return res.redirect(`${successRedirectUrl}?payment_id=${body.razorpay_payment_id}&order_id=${body.razorpay_order_id}`);
      }
    } catch (error) {
      this.logger.error(`Payment callback failed: ${error.message}`, error.stack);
      const failureRedirectUrl = process.env.FAILURE_REDIRECT_URL || 'http://localhost:3000/payment/failure';
      return res.redirect(`${failureRedirectUrl}?error=${encodeURIComponent('callback_error')}`);
    }
  }
}