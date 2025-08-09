import { Injectable, Inject, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @Inject('KAFKA_SERVICE') public readonly kafkaClient: ClientKafka,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
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
      return await this.orderRepository.findOne({ where: { razorpay_order_id: razorpayOrderId } });
    } catch (error) {
      this.logger.error(`Failed to find order by razorpay_order_id: ${razorpayOrderId}`, error.stack);
      return null;
    }
  }

  async markOrderAsPaid(razorpayOrderId: string): Promise<void> {
    const order = await this.findOrderByRazorpayId(razorpayOrderId);
    if (!order) {
      throw new NotFoundException(`Order with razorpay_order_id ${razorpayOrderId} not found`);
    }
    order.status = OrderStatus.SUCCESS;
    await this.orderRepository.save(order);
    this.logger.log(`Order marked as paid: ${razorpayOrderId}`);
  }

  async markOrderAsFailed(razorpayOrderId: string, errorDescription: string): Promise<void> {
    const order = await this.findOrderByRazorpayId(razorpayOrderId);
    if (!order) {
      throw new NotFoundException(`Order with razorpay_order_id ${razorpayOrderId} not found`);
    }
    order.status = OrderStatus.FAILED;
    await this.orderRepository.save(order);
    this.logger.log(`Order marked as failed: ${razorpayOrderId}, Reason: ${errorDescription}`);
  }
  

}