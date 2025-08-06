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
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'varchar', length: 24, nullable: true })
  product_id: string;

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

  // New fields
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 255 })
  image: string;

  @Column({ type: 'varchar', length: 50 })
  size: string;

  @Column({ type: 'varchar', length: 50 })
  color: string;

  @Column({ type: 'int' })
  quantity: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
