import { Controller, Post, Body, HttpException, HttpStatus, ValidationPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { Logger } from '@nestjs/common';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('order')
  async createOrder(@Body(ValidationPipe) createOrderDto: CreateOrderDto) {
    try {
      const order = await this.paymentService.createOrder(createOrderDto);
      return {
        success: true,
        order,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create order',
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
      let result;

      // Handle failed payment structure
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
        return res.redirect(
          `${failureRedirectUrl}?error=${encodeURIComponent(
            result.error_description || 'Payment failed',
          )}&order_id=${result.order_id}&payment_id=${result.payment_id}`,
        );
      } else {
        // Handle successful payment
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

        result = await this.paymentService.handleRazorpayCallback({
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          isFailedPayment: false,
        });

        this.logger.log(`Payment callback processed successfully: ${JSON.stringify(result)}`);

        const successRedirectUrl = process.env.SUCCESS_REDIRECT_URL || 'http://localhost:3000/payment/success';
        return res.redirect(
          `${successRedirectUrl}?payment_id=${result.payment_id}&order_id=${result.order_id}`,
        );
      }
    } catch (error) {
      this.logger.error(`Payment callback failed: ${error.message}`, error.stack);

      let orderId = 'unknown';
      if (body?.razorpay_order_id) {
        orderId = body.razorpay_order_id;
      } else if (body?.error?.metadata) {
        try {
          const metadata = JSON.parse(body.error.metadata);
          orderId = metadata.order_id;
        } catch (parseError) {
          this.logger.error(`Failed to parse error metadata: ${parseError.message}`);
        }
      }

      const failureRedirectUrl = process.env.FAILURE_REDIRECT_URL || 'http://localhost:3000/payment/failure';
      return res.redirect(
        `${failureRedirectUrl}?error=${encodeURIComponent(error.message || 'callback_error')}&order_id=${orderId}`,
      );
    }
  }
}