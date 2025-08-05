import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { OrderService } from './order.service';
import { SagaOrchestrator } from '../saga/saga.orchestrator';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly sagaOrchestrator: SagaOrchestrator,
  ) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.createOrder(createOrderDto);
    const sagaId = await this.sagaOrchestrator.executeSaga('PAYMENT_SAGA', {
      orderId: order.id,
      amount: createOrderDto.amount,
      currency: createOrderDto.currency,
      paymentMethod: createOrderDto.paymentMethod || 'card',
      email: createOrderDto.email,
      contact: createOrderDto.contact,
    });
    return { orderId: order.id, sagaId, razorpayOrderId: order.razorpay_order_id };
  }

  @Get(':sagaId/status')
  async getSagaStatus(@Param('sagaId') sagaId: string) {
    return this.sagaOrchestrator.getSagaStatus(sagaId);
  }
}