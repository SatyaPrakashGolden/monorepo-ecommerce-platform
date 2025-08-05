import { Controller, Post, Body, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  async handleWebhook(@Body() webhookData: any, @Headers('x-razorpay-signature') signature: string) {
    if (!this.paymentService.verifySignature(webhookData, signature)) {
      throw new Error('Invalid signature');
    }
    await this.paymentService.processWebhook(webhookData);
  }

  @Post('create')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto);
  }
}