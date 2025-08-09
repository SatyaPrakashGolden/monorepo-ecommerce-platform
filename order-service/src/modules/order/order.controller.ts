import { Controller, Post, Body, Logger } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { EventPattern } from '@nestjs/microservices';

@Controller('order')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) { }

  @Post('create-order')
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(createOrderDto);
  }

  @EventPattern('saga.order.create')
  async handleOrderCreate(data: any) {
    try {
      const orderData: CreateOrderDto = {
        user_id: data.payload.user_id,
        product_id: data.payload.cart_items.map(item => item.productId).join(','),
        total_amount: data.payload.total_amount,
        currency: data.payload.currency,
        saga_id: data.saga_id,
        status: OrderStatus.PENDING,
      };
      const order = await this.orderService.createOrder(orderData);
      await this.orderService.kafkaClient.emit('saga.order.created', {
        saga_id: data.saga_id,
        step_id: data.step_id,
        order_id: order.id,
        created_at: order.created_at,
      });
    } catch (error) {
      this.logger.error('Failed to create order', error.stack);
    }
  }
}