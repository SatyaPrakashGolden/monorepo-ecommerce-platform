// /home/satya/myproject/order-service/src/modules/order/entities/order.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'varchar', length: 24, nullable: true })
  seller_id: string;

  @Column({ type: 'varchar', length: 24, nullable: true })
  variant_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount: string;

  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  razorpay_order_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  receipt: string;

  @Column({ type: 'bigint', nullable: true })
  razorpay_created_at: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}