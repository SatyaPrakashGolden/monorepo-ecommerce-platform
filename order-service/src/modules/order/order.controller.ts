import {
  Controller,
  Post,
  Body,
  Logger,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { EventPattern } from '@nestjs/microservices';
import { OrderStatus } from './entities/order.entity';

@Controller('order')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Post('create-order')
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(createOrderDto);
  }

  @EventPattern('payment-order-created')
  async handlePaymentOrderCreated(data: any) {
    try {
      this.logger.log(`Received payment-order-created event: ${JSON.stringify(data)}`);
      
      const createOrderDto: CreateOrderDto = {
        user_id: data.user_id,
        product_id: data.product_id || data.variant_id,
        total_amount: parseFloat(data.total_amount),
        currency: data.currency || 'INR',
        status: OrderStatus.PENDING,
        razorpay_order_id: data.razorpay_order_id,
        receipt: data.receipt,
        razorpay_created_at: data.razorpay_created_at,
      };

      await this.orderService.createOrder(createOrderDto);
    } catch (error) {
      this.logger.error('Failed to handle payment-order-created event', error.stack);
    }
  }

  @EventPattern('payment-verified')
  async handlePaymentVerified(data: any) {
    try {
      this.logger.log(`Received payment-verified event: ${JSON.stringify(data)}`);
      await this.orderService.markOrderAsPaid(data.razorpay_order_id);
    } catch (error) {
      this.logger.error('Failed to handle payment-verified event', error.stack);
    }
  }

  @EventPattern('payment-failed')
  async handlePaymentFailed(data: any) {
    try {
      this.logger.log(`Received payment-failed event: ${JSON.stringify(data)}`);
      await this.orderService.markOrderAsFailed(data.razorpay_order_id, data.error_description);
    } catch (error) {
      this.logger.error('Failed to handle payment-failed event', error.stack);
    }
  }
}
