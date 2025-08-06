// /home/satya/ecommercebackend/ecommerceBackend/order-service/src/modules/order/order.service.ts
import {
  Injectable, Inject,
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
@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) { }


  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const order = this.orderRepository.create({
        ...createOrderDto,
        status: createOrderDto.status
      });
      return await this.orderRepository.save(order);
    } catch (error) {
      this.logger.error('Failed to create order', error.stack);
      throw new BadRequestException('Could not create order');
    }
  }


  async markOrderAsPaid(razorpayOrderId: string): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { razorpay_order_id: razorpayOrderId } });
    if (!order) {
      this.logger.warn(`Order with Razorpay Order ID ${razorpayOrderId} not found`);
      throw new NotFoundException('Order not found');
    }
    order.status = OrderStatus.SUCCESS;
    await this.orderRepository.save(order);
    this.logger.log(`✅ Order marked as success: ${order.id}`);
  }

}
