import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { ClientKafka } from '@nestjs/microservices';
import { OrderStatus } from './entities/order.entity';
import { EventPattern } from '@nestjs/microservices';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      // Ensure total_amount is properly converted
      const orderData = {
        ...createOrderDto,
        total_amount: Number(createOrderDto.total_amount),
        status: createOrderDto.status || OrderStatus.PENDING,
      };

      const order = this.orderRepository.create(orderData);
      const savedOrder = await this.orderRepository.save(order);
      
      this.logger.log(`Order created successfully: ${savedOrder.id}`);
      return savedOrder;
    } catch (error) {
      this.logger.error('Failed to create order', error.stack);
      throw new BadRequestException('Could not create order');
    }
  }

  async findOrderByRazorpayId(razorpayOrderId: string): Promise<Order | null> {
    try {
      return await this.orderRepository.findOne({
        where: { razorpay_order_id: razorpayOrderId },
      });
    } catch (error) {
      this.logger.error(`Failed to find order by razorpay_order_id: ${razorpayOrderId}`, error.stack);
      return null;
    }
  }

  async findOrdersByUserId(userId: number): Promise<Order[]> {
    try {
      return await this.orderRepository.find({
        where: { user_id: userId },
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to find orders for user: ${userId}`, error.stack);
      throw new BadRequestException('Could not retrieve orders');
    }
  }

  async markOrderAsPaid(razorpayOrderId: string): Promise<Order> {
    const order = await this.findOrderByRazorpayId(razorpayOrderId);
    
    if (!order) {
      this.logger.warn(`Order with Razorpay Order ID ${razorpayOrderId} not found`);
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.SUCCESS) {
      this.logger.warn(`Order ${order.id} is already marked as paid`);
      return order;
    }

    try {
      order.status = OrderStatus.SUCCESS;
      const updatedOrder = await this.orderRepository.save(order);
      
      this.logger.log(`✅ Order marked as success: ${updatedOrder.id}`);
      
      // Emit event for successful payment
      await this.kafkaClient.emit('order-payment-success', {
        orderId: updatedOrder.id,
        userId: updatedOrder.user_id,
        productId: updatedOrder.product_id,
        amount: updatedOrder.total_amount,
        razorpayOrderId: updatedOrder.razorpay_order_id,
      }).toPromise();

      return updatedOrder;
    } catch (error) {
      this.logger.error(`Failed to mark order as paid: ${razorpayOrderId}`, error.stack);
      throw new BadRequestException('Could not update order status');
    }
  }

  async markOrderAsFailed(razorpayOrderId: string, reason?: string): Promise<Order> {
    const order = await this.findOrderByRazorpayId(razorpayOrderId);
    
    if (!order) {
      this.logger.warn(`Order with Razorpay Order ID ${razorpayOrderId} not found`);
      throw new NotFoundException('Order not found');
    }

    try {
      order.status = OrderStatus.FAILED;
      const updatedOrder = await this.orderRepository.save(order);
      
      this.logger.log(`❌ Order marked as failed: ${updatedOrder.id}, Reason: ${reason || 'Unknown'}`);
      
      // Emit event for failed payment
      await this.kafkaClient.emit('order-payment-failed', {
        orderId: updatedOrder.id,
        userId: updatedOrder.user_id,
        productId: updatedOrder.product_id,
        amount: updatedOrder.total_amount,
        razorpayOrderId: updatedOrder.razorpay_order_id,
        reason: reason || 'Payment failed',
      }).toPromise();

      return updatedOrder;
    } catch (error) {
      this.logger.error(`Failed to mark order as failed: ${razorpayOrderId}`, error.stack);
      throw new BadRequestException('Could not update order status');
    }
  }

  async markOrderAsCancelled(razorpayOrderId: string, reason?: string): Promise<Order> {
    const order = await this.findOrderByRazorpayId(razorpayOrderId);
    
    if (!order) {
      this.logger.warn(`Order with Razorpay Order ID ${razorpayOrderId} not found`);
      throw new NotFoundException('Order not found');
    }

    try {
      order.status = OrderStatus.CANCELLED;
      const updatedOrder = await this.orderRepository.save(order);
      
      this.logger.log(`🚫 Order marked as cancelled: ${updatedOrder.id}, Reason: ${reason || 'User cancelled'}`);
      
      // Emit event for cancelled payment
      await this.kafkaClient.emit('order-payment-cancelled', {
        orderId: updatedOrder.id,
        userId: updatedOrder.user_id,
        productId: updatedOrder.product_id,
        amount: updatedOrder.total_amount,
        razorpayOrderId: updatedOrder.razorpay_order_id,
        reason: reason || 'Order cancelled',
      }).toPromise();

      return updatedOrder;
    } catch (error) {
      this.logger.error(`Failed to mark order as cancelled: ${razorpayOrderId}`, error.stack);
      throw new BadRequestException('Could not update order status');
    }
  }
}