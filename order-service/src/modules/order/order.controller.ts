// order/order.controller.ts
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

@Controller('order')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Post('create-order')
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(createOrderDto);
  }

  // Saga Event Handlers
  @EventPattern('order-creation-started')
  async handleOrderCreationStarted(data: any) {
    try {
      this.logger.log(`Received order-creation-started event: ${JSON.stringify(data)}`);
      // This event is handled by payment service, order service just logs it
    } catch (error) {
      this.logger.error('Failed to handle order-creation-started event', error.stack);
    }
  }

  @EventPattern('order-created')
  async handleOrderCreated(data: any) {
    try {
      this.logger.log(`Received order-created event: ${JSON.stringify(data)}`);
      await this.orderService.handleOrderCreated(data);
    } catch (error) {
      this.logger.error('Failed to handle order-created event', error.stack);
    }
  }

  @EventPattern('payment-processing-started')
  async handlePaymentProcessingStarted(data: any) {
    try {
      this.logger.log(`Received payment-processing-started event: ${JSON.stringify(data)}`);
      // Order service can log this for monitoring
    } catch (error) {
      this.logger.error('Failed to handle payment-processing-started event', error.stack);
    }
  }

  @EventPattern('payment-verified')
  async handlePaymentVerified(data: any) {
    try {
      this.logger.log(`Received payment-verified event: ${JSON.stringify(data)}`);
      await this.orderService.handlePaymentVerified(data);
    } catch (error) {
      this.logger.error('Failed to handle payment-verified event', error.stack);
    }
  }

  @EventPattern('payment-failed')
  async handlePaymentFailed(data: any) {
    try {
      this.logger.log(`Received payment-failed event: ${JSON.stringify(data)}`);
      await this.orderService.handlePaymentFailed(data);
    } catch (error) {
      this.logger.error('Failed to handle payment-failed event', error.stack);
    }
  }

  @EventPattern('order-cancellation-requested')
  async handleOrderCancellationRequest(data: any) {
    try {
      this.logger.log(`Received order-cancellation-requested event: ${JSON.stringify(data)}`);
      await this.orderService.handleOrderCancellationRequest(data);
    } catch (error) {
      this.logger.error('Failed to handle order-cancellation-requested event', error.stack);
    }
  }

  @EventPattern('payment-reversal-requested')
  async handlePaymentReversalRequest(data: any) {
    try {
      this.logger.log(`Received payment-reversal-requested event: ${JSON.stringify(data)}`);
      // Order service acknowledges the reversal request
    } catch (error) {
      this.logger.error('Failed to handle payment-reversal-requested event', error.stack);
    }
  }

  @EventPattern('payment-reversed')
  async handlePaymentReversed(data: any) {
    try {
      this.logger.log(`Received payment-reversed event: ${JSON.stringify(data)}`);
      // Order service can update internal status if needed
    } catch (error) {
      this.logger.error('Failed to handle payment-reversed event', error.stack);
    }
  }
}