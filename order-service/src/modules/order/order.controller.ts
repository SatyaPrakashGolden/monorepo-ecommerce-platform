// /home/satya/ecommercebackend/ecommerceBackend/order-service/src/modules/order/order.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post('creat-order')
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(createOrderDto);
  }

  @EventPattern('payment-order-created')
  async handlePurchaseProduct(@Payload() message: any) {
    const orderData: CreateOrderDto = message.value ?? message; 
    console.log('✅ Purchase Event Received in Order Service:', orderData);
    return this.orderService.createOrder(orderData);
  }


  @EventPattern('verify-payment')
  async handlePaymentVerification(@Payload() message: any) {
    const data = message.value ?? message;
    const { razorpay_order_id } = data;

    console.log('✅ Payment Verified Event Received in Order Service:', razorpay_order_id);

    await this.orderService.markOrderAsPaid(razorpay_order_id);
  }

}