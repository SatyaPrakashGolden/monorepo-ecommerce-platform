// /home/satya/myproject/order-service/src/modules/order/order.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import Razorpay from 'razorpay';
import { Cashfree } from 'cashfree-sdk'; // Assuming Cashfree SDK is installed

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly razorpay: Razorpay;
  private readonly cashfree: Cashfree;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    this.cashfree = new Cashfree({
      appId: process.env.CASHFREE_APP_ID,
      secretKey: process.env.CASHFREE_SECRET_KEY,
    });
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { paymentGateway, ...orderData } = createOrderDto;
    const order = this.orderRepository.create({
      ...orderData,
      status: OrderStatus.PENDING,
      gateway_type: paymentGateway,
    });

    let gatewayOrderId: string;
    if (paymentGateway === 'razorpay') {
      const razorpayOrder = await this.razorpay.orders.create({
        amount: orderData.amount * 100, // Convert to paise
        currency: orderData.currency,
        receipt: `receipt_${order.id}`,
        notes: { internalOrderId: order.id.toString() },
      });
      gatewayOrderId = razorpayOrder.id;
    } else if (paymentGateway === 'cashfree') {
      const cashfreeOrder = await this.cashfree.createOrder({
        orderId: `cf_order_${order.id}`,
        orderAmount: orderData.amount,
        orderCurrency: orderData.currency,
        customerDetails: {
          customerId: orderData.userId.toString(),
          customerEmail: orderData.email,
          customerPhone: orderData.contact,
        },
        orderMeta: {
          notifyUrl: 'http://localhost:3002/payment/webhook/cashfree',
        },
        notes: { internalOrderId: order.id.toString() },
      });
      gatewayOrderId = cashfreeOrder.orderId;
    } else {
      throw new Error('Unsupported payment gateway');
    }

    order.gateway_order_id = gatewayOrderId;
    await this.orderRepository.save(order);
    this.logger.log(`Order ${order.id} created with ${paymentGateway} order ID ${gatewayOrderId}`);
    return order;
  }

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      this.logger.warn(`Order ${orderId} not found`);
      throw new Error(`Order ${orderId} not found`);
    }
    if (order.status === status) {
      this.logger.log(`Order ${orderId} already in status ${status}`);
      return;
    }
    order.status = status;
    await this.orderRepository.save(order);
    this.logger.log(`Order ${orderId} status updated to ${status}`);
  }

  async getOrder(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    return order;
  }
}