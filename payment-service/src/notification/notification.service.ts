import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async sendPaymentSuccessNotification(data: { user_id: number; order_id: number; payment_id: string; amount: number }): Promise<void> {
    try {
      this.logger.log(`Sending payment success notification to user: ${data.user_id}`);
      await this.kafkaClient.emit('notification.payment.success', {
        user_id: data.user_id,
        order_id: data.order_id,
        payment_id: data.payment_id,
        amount: data.amount,
      });
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }
}