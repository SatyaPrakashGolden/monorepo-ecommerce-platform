import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { PaymentSagaOrchestrator } from './payment-saga-orchestrator.service';
import { PaymentService } from './payment.service';

@Controller()
export class SagaEventController {
  private readonly logger = new Logger(SagaEventController.name);

  constructor(
    private readonly sagaOrchestrator: PaymentSagaOrchestrator,
    private readonly paymentService: PaymentService,
  ) {}

  // Handle inventory reserve step
  @EventPattern('saga.inventory.reserved')
  async handleInventoryReserved(data: any) {
    this.logger.log(`Received saga.inventory.reserved: ${JSON.stringify(data)}`);
    try {
      await this.sagaOrchestrator.handleStepSuccess(data.step_id, {
        inventory_reserved: true,
        reserved_items: data.reserved_items,
      });
    } catch (error) {
      this.logger.error(`Error in handleInventoryReserved: ${error.message}`, error.stack);
      const step = await this.sagaOrchestrator['sagaStepRepository'].findOne({ where: { id: data.step_id } });
      if (step) {
        await this.sagaOrchestrator.handleStepFailure(step, error.message);
      }
    }
  }

  // Handle order creation step - THIS WAS MISSING!
  @EventPattern('saga.order.created')
  async handleOrderCreated(data: any) {
    this.logger.log(`Received saga.order.created: ${JSON.stringify(data)}`);
    try {
      await this.sagaOrchestrator.handleStepSuccess(data.step_id, {
        order_id: data.order_id,
        order_created_at: data.created_at,
      });
    } catch (error) {
      this.logger.error(`Error in handleOrderCreated: ${error.message}`, error.stack);
      const step = await this.sagaOrchestrator['sagaStepRepository'].findOne({ where: { id: data.step_id } });
      if (step) {
        await this.sagaOrchestrator.handleStepFailure(step, error.message);
      }
    }
  }

// Handle payment processing step
@EventPattern('saga.payment.process')
async handlePaymentProcess(data: any) {
  this.logger.log(`Received saga.payment.process: ${JSON.stringify(data)}`);
  try {
    // Check if Razorpay order already exists in saga context
    const saga = await this.sagaOrchestrator['sagaRepository'].findOne({ 
      where: { saga_id: data.saga_id } 
    });
    
    if (!saga) {
      throw new Error(`Saga not found: ${data.saga_id}`);
    }

    // If Razorpay order already exists, just complete the step
    if (saga.razorpay_order_id) {
      this.logger.log(`Razorpay order already exists: ${saga.razorpay_order_id}`);
      await this.sagaOrchestrator.handleStepSuccess(data.step_id, {
        razorpay_order_id: saga.razorpay_order_id,
        payment_ready: true,
        already_created: true
      });
      return;
    }

    // Fallback: Create Razorpay order if not already created
    const product_id = data.payload.cart_items?.map(item => item.productId).join(',') || 'unknown';
    
    const razorpayOrder = await this.paymentService.createRazorpayOrder({
      total_amount: data.payload.total_amount,
      currency: data.payload.currency,
      user_id: data.payload.user_id,
      product_id: product_id,
      saga_id: data.saga_id,
    });
    
    this.logger.log(`Razorpay order created: ${JSON.stringify(razorpayOrder)}`);
    
    // Update saga with razorpay_order_id
    saga.razorpay_order_id = razorpayOrder.id;
    await this.sagaOrchestrator['sagaRepository'].save(saga);
    
    this.logger.log(`Saga updated with razorpay_order_id: ${razorpayOrder.id}`);
    
    await this.sagaOrchestrator.handleStepSuccess(data.step_id, {
      razorpay_order_id: razorpayOrder.id,
      razorpay_amount: razorpayOrder.amount,
      razorpay_status: razorpayOrder.status,
      razorpay_receipt: razorpayOrder.receipt,
    });
  } catch (error) {
    this.logger.error(`Error in handlePaymentProcess: ${error.message}`, error.stack);
    const step = await this.sagaOrchestrator['sagaStepRepository'].findOne({ where: { id: data.step_id } });
    if (step) {
      await this.sagaOrchestrator.handleStepFailure(step, error.message);
    } else {
      await this.sagaOrchestrator.startCompensation(data.saga_id);
    }
  }
}
  // Handle payment success
  @EventPattern('saga.payment.success')
  async handlePaymentSuccess(data: any) {
    this.logger.log(`Received saga.payment.success: ${JSON.stringify(data)}`);
    try {
      // Verify payment signature
      const verificationResult = await this.paymentService.verifyPayment({
        razorpay_payment_id: data.payment_id,
        razorpay_order_id: data.order_id,
        razorpay_signature: data.signature,
      });
      
      if (verificationResult.success) {
        // Update saga with payment_id
        const saga = await this.sagaOrchestrator['sagaRepository'].findOne({ where: { saga_id: data.saga_id } });
        if (saga) {
          saga.payment_id = data.payment_id;
          await this.sagaOrchestrator['sagaRepository'].save(saga);
        }
        
        // Continue to next step (inventory confirm)
        await this.sagaOrchestrator.executeNextStep(data.saga_id);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      this.logger.error(`Payment success handling failed: ${error.message}`, error.stack);
      await this.sagaOrchestrator.startCompensation(data.saga_id);
    }
  }

  // Handle payment failure
  @EventPattern('saga.payment.failed')
  async handlePaymentFailure(data: any) {
    this.logger.log(`Received saga.payment.failed: ${JSON.stringify(data)}`);
    try {
      await this.sagaOrchestrator.startCompensation(data.saga_id);
    } catch (error) {
      this.logger.error(`Payment failure handling failed: ${error.message}`, error.stack);
    }
  }

  // Handle inventory confirmation
  @EventPattern('saga.inventory.confirmed')
  async handleInventoryConfirmed(data: any) {
    this.logger.log(`Received saga.inventory.confirmed: ${JSON.stringify(data)}`);
    try {
      await this.sagaOrchestrator.handleStepSuccess(data.step_id, {
        inventory_confirmed: true,
        confirmation_details: data.confirmation_details,
      });
    } catch (error) {
      this.logger.error(`Error in handleInventoryConfirmed: ${error.message}`, error.stack);
      const step = await this.sagaOrchestrator['sagaStepRepository'].findOne({ where: { id: data.step_id } });
      if (step) {
        await this.sagaOrchestrator.handleStepFailure(step, error.message);
      }
    }
  }

  // Handle order confirmation
  @EventPattern('saga.order.confirmed')
  async handleOrderConfirmed(data: any) {
    this.logger.log(`Received saga.order.confirmed: ${JSON.stringify(data)}`);
    try {
      await this.sagaOrchestrator.handleStepSuccess(data.step_id, {
        order_confirmed: true,
        confirmation_details: data.confirmation_details,
      });
    } catch (error) {
      this.logger.error(`Error in handleOrderConfirmed: ${error.message}`, error.stack);
      const step = await this.sagaOrchestrator['sagaStepRepository'].findOne({ where: { id: data.step_id } });
      if (step) {
        await this.sagaOrchestrator.handleStepFailure(step, error.message);
      }
    }
  }

  // Handle notification sent
  @EventPattern('saga.notification.sent')
  async handleNotificationSent(data: any) {
    this.logger.log(`Received saga.notification.sent: ${JSON.stringify(data)}`);
    try {
      await this.sagaOrchestrator.handleStepSuccess(data.step_id, {
        notification_sent: true,
        notification_details: data.notification_details,
      });
    } catch (error) {
      this.logger.error(`Error in handleNotificationSent: ${error.message}`, error.stack);
      const step = await this.sagaOrchestrator['sagaStepRepository'].findOne({ where: { id: data.step_id } });
      if (step) {
        await this.sagaOrchestrator.handleStepFailure(step, error.message);
      }
    }
  }
}