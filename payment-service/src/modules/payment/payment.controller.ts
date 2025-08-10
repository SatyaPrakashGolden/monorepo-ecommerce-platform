// payment/payment.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  HttpException, 
  HttpStatus, 
  ValidationPipe, 
  Res, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { Logger } from '@nestjs/common';
import { UserAuthGuard } from '../../auth/user.middleware';  // Assume this exists
import { EventPattern } from '@nestjs/microservices';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('order')
  @UseGuards(UserAuthGuard) // Use the UserAuthGuard for authentication
  async createOrder(
    @Request() req,
    @Body(ValidationPipe) createOrderDto: CreateOrderDto
  ) {
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
        let metadata;
        try {
          metadata = JSON.parse(body.error.metadata);
        } catch (parseError) {
          this.logger.error(`Failed to parse error metadata: ${parseError.message}`);
          const failureRedirectUrl = process.env.FAILURE_REDIRECT_URL || 'http://localhost:3000/payment/failure';
          return res.redirect(
            `${failureRedirectUrl}?error=${encodeURIComponent('Invalid metadata format')}`
          );
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
        return res.redirect(
          `${failureRedirectUrl}?error=${encodeURIComponent(
            result.error_description || 'Payment failed',
          )}&user_id=${user_id}&payment_id=${payment_id}&saga_id=${result.sagaId}`,
        );
      } else {
        // Handle successful payment
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
          throw new HttpException('Missing required payment parameters', HttpStatus.BAD_REQUEST);
        }

        result = await this.paymentService.handleRazorpayCallback({
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          isFailedPayment: false,
        });

        this.logger.log(`Payment callback processed successfully: ${JSON.stringify(result)}`);

        const successRedirectUrl = process.env.SUCCESS_REDIRECT_URL || 'http://localhost:3000/payment/success';
        return res.redirect(
          `${successRedirectUrl}?payment_id=${result.payment_id}&order_id=${result.order_id}&saga_id=${result.sagaId}`
        );
      }
    } catch (error) {
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
        } catch (parseError) {
          this.logger.error(`Failed to parse error metadata: ${parseError.message}`);
        }
      }

      const failureRedirectUrl = process.env.FAILURE_REDIRECT_URL || 'http://localhost:3000/payment/failure';
      return res.redirect(
        `${failureRedirectUrl}?error=${encodeURIComponent(
          error.message || 'callback_error'
        )}&user_id=${userId}&order_id=${orderId}`,
      );
    }
  }
  
  // Saga Event Handlers
  @EventPattern('order-creation-started')
  async handleOrderCreationStarted(data: any) {
    try {
      this.logger.log(`Received order-creation-started event: ${JSON.stringify(data)}`);
      // Payment service initiates this event, so just log for monitoring
    } catch (error) {
      this.logger.error('Failed to handle order-creation-started event', error.stack);
    }
  }

  @EventPattern('order-created')
  async handleOrderCreated(data: any) {
    try {
      this.logger.log(`Received order-created event: ${JSON.stringify(data)}`);
      // Payment service acknowledges order creation
    } catch (error) {
      this.logger.error('Failed to handle order-created event', error.stack);
    }
  }

  @EventPattern('payment-reversal-requested')
  async handlePaymentReversalRequest(data: any) {
    try {
      this.logger.log(`Received payment-reversal-requested event: ${JSON.stringify(data)}`);
      await this.paymentService.handlePaymentReversalRequest(data);
    } catch (error) {
      this.logger.error('Failed to handle payment-reversal-requested event', error.stack);
    }
  }

  @EventPattern('order-completed')
  async handleOrderCompleted(data: any) {
    try {
      this.logger.log(`Received order-completed event: ${JSON.stringify(data)}`);
      // Payment service can perform final cleanup or notifications
    } catch (error) {
      this.logger.error('Failed to handle order-completed event', error.stack);
    }
  }

  @EventPattern('order-failed')
  async handleOrderFailed(data: any) {
    try {
      this.logger.log(`Received order-failed event: ${JSON.stringify(data)}`);
      // Payment service can perform cleanup or notifications
    } catch (error) {
      this.logger.error('Failed to handle order-failed event', error.stack);
    }
  }
}