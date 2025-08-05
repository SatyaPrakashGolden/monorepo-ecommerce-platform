import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderStatus } from './entities/order.entity';

@Injectable()
export class OrderListener implements OnModuleInit {
  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
    private readonly orderService: OrderService,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('payment.created');
    this.kafkaClient.subscribeToResponseOf('payment.captured');
    this.kafkaClient.subscribeToResponseOf('payment.failed');
    await this.kafkaClient.connect();
  }

  @EventPattern('payment.created')
  async handlePaymentCreated(data: { orderId: number; paymentId: string }) {
    // No action needed; saga will proceed with payment processing
  }

  @EventPattern('payment.captured')
  async handlePaymentCaptured(data: { orderId: number; paymentId: string }) {
    await this.orderService.updateOrderStatus(data.orderId, OrderStatus.SUCCESS);
  }

  @EventPattern('payment.failed')
  async handlePaymentFailed(data: { orderId: number; reason: string }) {
    await this.orderService.updateOrderStatus(data.orderId, OrderStatus.FAILED);
  }
}