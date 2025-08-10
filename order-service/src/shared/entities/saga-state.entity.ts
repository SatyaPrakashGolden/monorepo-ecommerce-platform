// shared/entities/saga-state.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SagaStatus {
  STARTED = 'STARTED',
  ORDER_CREATED = 'ORDER_CREATED',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
  PAYMENT_VERIFIED = 'PAYMENT_VERIFIED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED',
}
@Entity('saga_state')
@Index(['correlation_id'])
@Index(['razorpay_order_id'])
export class SagaState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  saga_id: string;

  @Column({ type: 'varchar', length: 100 })
  correlation_id: string;

  @Column({
    type: 'enum',
    enum: SagaStatus,
    default: SagaStatus.STARTED,
  })
  status: SagaStatus;

  @Column({ type: 'varchar', length: 50 })
  saga_type: string;

  @Column({ type: 'json', nullable: true })
  payload: any;

  @Column({ type: 'json', nullable: true })
  compensation_data: any;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'int', default: 0 })
  retry_count: number;

  @Column({ type: 'int', default: 3 })
  max_retries: number;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  razorpay_order_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
