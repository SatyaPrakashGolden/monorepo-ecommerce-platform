// order/order.service.ts
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
import { SagaOrchestratorService } from '../../shared/services/saga-orchestrator.service';
import { SagaStatus } from '../../shared/entities/saga-state.entity';
import { SagaLogger } from '../../shared/utils/saga-logger.util';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly sagaLogger = SagaLogger.getInstance();

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly sagaOrchestrator: SagaOrchestratorService,
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

  async markOrderAsPaid(sagaId: string, razorpayOrderId: string, paymentId: number): Promise<Order> {
    const order = await this.findOrderByRazorpayId(razorpayOrderId);
    
    if (!order) {
      this.logger.warn(`Order with Razorpay Order ID ${razorpayOrderId} not found`);
      
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED, 
        null, 
        'Order not found for payment completion'
      );
      
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.SUCCESS) {
      this.logger.warn(`Order ${order.id} is already marked as paid`);
      return order;
    }

    try {
      order.status = OrderStatus.SUCCESS;
      order.payment_id = paymentId;
      const updatedOrder = await this.orderRepository.save(order);
      
      this.logger.log(`✅ Order marked as success: ${updatedOrder.id}`);
      
      // Update saga to completed status
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.COMPLETED,
        {
          orderId: updatedOrder.id,
          finalStatus: OrderStatus.SUCCESS,
        }
      );

      // Emit order completed event
      await this.kafkaClient.emit('order-completed', {
        sagaId,
        timestamp: Date.now(),
        correlationId: uuidv4(),
        version: 1,
        type: 'ORDER_COMPLETED',
        payload: {
          orderId: updatedOrder.id,
          razorpayOrderId: updatedOrder.razorpay_order_id,
          paymentId: paymentId,
          userId: updatedOrder.user_id,
          amount: updatedOrder.total_amount,
          status: 'SUCCESS' as const,
        },
      }).toPromise();

      this.sagaLogger.logSagaComplete(sagaId, 'completed');
      return updatedOrder;
    } catch (error) {
      this.sagaLogger.logSagaError(sagaId, error);
      this.logger.error(`Failed to mark order as paid: ${razorpayOrderId}`, error.stack);
      
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED, 
        null, 
        'Failed to update order status to paid'
      );
      
      throw new BadRequestException('Could not update order status');
    }
  }

  async markOrderAsFailed(sagaId: string, razorpayOrderId: string, reason?: string): Promise<Order> {
    const order = await this.findOrderByRazorpayId(razorpayOrderId);
    
    if (!order) {
      this.logger.warn(`Order with Razorpay Order ID ${razorpayOrderId} not found`);
      
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED, 
        null, 
        'Order not found for failure marking'
      );
      
      throw new NotFoundException('Order not found');
    }

    try {
      order.status = OrderStatus.FAILED;
      const updatedOrder = await this.orderRepository.save(order);
      
      this.logger.log(`❌ Order marked as failed: ${updatedOrder.id}, Reason: ${reason || 'Unknown'}`);
      
      // Update saga to failed status
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED,
        {
          orderId: updatedOrder.id,
          finalStatus: OrderStatus.FAILED,
          failureReason: reason,
        },
        reason
      );

      // Emit order failed event
      await this.kafkaClient.emit('order-failed', {
        sagaId,
        timestamp: Date.now(),
        correlationId: uuidv4(),
        version: 1,
        type: 'ORDER_FAILED',
        payload: {
          orderId: updatedOrder.id,
          razorpayOrderId: updatedOrder.razorpay_order_id,
          userId: updatedOrder.user_id,
          amount: updatedOrder.total_amount,
          reason: reason || 'Payment failed',
          status: 'FAILED' as const,
        },
      }).toPromise();

      return updatedOrder;
    } catch (error) {
      this.sagaLogger.logSagaError(sagaId, error);
      this.logger.error(`Failed to mark order as failed: ${razorpayOrderId}`, error.stack);
      
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED, 
        null, 
        'Failed to update order status to failed'
      );
      
      throw new BadRequestException('Could not update order status');
    }
  }

  async markOrderAsCancelled(sagaId: string, razorpayOrderId: string, reason?: string): Promise<Order> {
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
        sagaId,
        timestamp: Date.now(),
        correlationId: uuidv4(),
        version: 1,
        type: 'ORDER_CANCELLATION_REQUESTED',
        payload: {
          orderId: updatedOrder.id,
          userId: updatedOrder.user_id,
          productId: updatedOrder.product_id,
          amount: updatedOrder.total_amount,
          razorpayOrderId: updatedOrder.razorpay_order_id,
          reason: reason || 'Order cancelled',
        },
      }).toPromise();

      return updatedOrder;
    } catch (error) {
      this.sagaLogger.logSagaError(sagaId, error);
      this.logger.error(`Failed to mark order as cancelled: ${razorpayOrderId}`, error.stack);
      throw new BadRequestException('Could not update order status');
    }
  }

  async handleOrderCreated(event: any): Promise<void> {
    const { sagaId, payload } = event;
    
    try {
      this.logger.log(`Handling order creation for saga: ${sagaId}`);
      
      const createOrderDto: CreateOrderDto = {
        user_id: payload.userId,
        product_id: payload.productId,
        total_amount: payload.amount,
        currency: payload.currency || 'INR',
        status: OrderStatus.PENDING,
        razorpay_order_id: payload.razorpayOrderId,
        receipt: payload.receipt,
        razorpay_created_at: Date.now(),
      };

      const order = await this.createOrder(createOrderDto);
      
      // Update saga with created order information
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.ORDER_CREATED, 
        {
          orderId: order.id,
          razorpayOrderId: order.razorpay_order_id,
        }
      );
      
      this.logger.log(`Order created for saga ${sagaId}: ${order.id}`);
    } catch (error) {
      this.sagaLogger.logSagaError(sagaId, error);
      this.logger.error(`Failed to handle order creation for saga ${sagaId}:`, error);
      
      await this.sagaOrchestrator.updateSagaStatus(
        sagaId, 
        SagaStatus.FAILED, 
        null, 
        `Order creation failed: ${error.message}`
      );
    }
  }

  async handlePaymentVerified(event: any): Promise<void> {
    const { sagaId, payload } = event;
    
    try {
      this.logger.log(`Handling payment verification for saga: ${sagaId}`);
      await this.markOrderAsPaid(sagaId, payload.razorpayOrderId, payload.paymentId);
    } catch (error) {
      this.sagaLogger.logSagaError(sagaId, error);
      this.logger.error(`Failed to handle payment verification for saga ${sagaId}:`, error);
      
      // Try to compensate by requesting payment reversal
      await this.kafkaClient.emit('payment-reversal-requested', {
        sagaId,
        timestamp: Date.now(),
        correlationId: uuidv4(),
        version: 1,
        type: 'PAYMENT_REVERSAL_REQUESTED',
        payload: {
          razorpayPaymentId: payload.razorpayPaymentId,
          razorpayOrderId: payload.razorpayOrderId,
          amount: payload.amount,
          reason: 'Order completion failed',
        },
      }).toPromise();
    }
  }

  async handlePaymentFailed(event: any): Promise<void> {
    const { sagaId, payload } = event;
    
    try {
      this.logger.log(`Handling payment failure for saga: ${sagaId}`);
      await this.markOrderAsFailed(sagaId, payload.razorpayOrderId, payload.errorDescription);
    } catch (error) {
      this.sagaLogger.logSagaError(sagaId, error);
      this.logger.error(`Failed to handle payment failure for saga ${sagaId}:`, error);
    }
  }

  async handleOrderCancellationRequest(event: any): Promise<void> {
    const { sagaId, payload } = event;
    
    try {
      this.logger.log(`Handling order cancellation request for saga: ${sagaId}`);
      await this.markOrderAsCancelled(sagaId, payload.razorpayOrderId, payload.reason);
    } catch (error) {
      this.sagaLogger.logSagaError(sagaId, error);
      this.logger.error(`Failed to handle order cancellation for saga ${sagaId}:`, error);
    }
  }
}