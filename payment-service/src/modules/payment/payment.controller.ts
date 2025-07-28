// src/modules/payment/payment.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';


import { Res } from '@nestjs/common';

import { Response } from 'express'; 
@Controller('payment')
export class PaymentController {
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
  @Body() body: any,
  @Res() res: Response
) {
  try {
    console.log("---------------body data-------------------->", body);
    let result;

    // Handle failed payment structure (from Razorpay if any)
    if (body?.error?.metadata) {
      // Parse the metadata string as JSON
      const metadata = JSON.parse(body.error.metadata);
      const { payment_id, order_id } = metadata;
      
      console.log("Failed payment ->", payment_id, order_id);
      
      result = await this.paymentService.handleRazorpayCallback({
        razorpay_payment_id: payment_id,
        razorpay_order_id: order_id,
        razorpay_signature: '', // no signature on failure
        isFailedPayment: true, // Flag to indicate this is a failed payment
      });

      // Redirect to failure page for failed payments
      return res.redirect(
        `http://localhost:3000/payment/failure?error=${encodeURIComponent(
          result.error_description || 'Payment failed'
        )}&order_id=${result.order_id}&payment_id=${result.payment_id}`
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

      console.log('✅ Payment callback processed successfully:', result);
      
      // Redirect to success page for successful payments
      return res.redirect(
        `http://localhost:3000/payment/success?payment_id=${result.payment_id}&order_id=${result.order_id}`
      );
    }
    
  } catch (error) {
    console.error('❌ Payment callback failed:', error);

    let orderId = 'unknown';
    
    // Try to extract order_id from different possible locations
    if (body?.razorpay_order_id) {
      orderId = body.razorpay_order_id;
    } else if (body?.error?.metadata) {
      try {
        const metadata = JSON.parse(body.error.metadata);
        orderId = metadata.order_id;
      } catch (parseError) {
        console.error('Failed to parse error metadata:', parseError);
      }
    }

    return res.redirect(
      `http://localhost:3000/payment/failure?error=${encodeURIComponent(
        error.message || 'callback_error'
      )}&order_id=${orderId}`
    );
  }
}


}