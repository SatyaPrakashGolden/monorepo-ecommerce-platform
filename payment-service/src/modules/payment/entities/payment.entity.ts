import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number; // Auto-increment primary key

  @Column({ type: 'varchar', length: 50, nullable: true })
  payment_id?: string;

  @Column({ type: 'varchar', default: 'payment' })
  entity: string;
  @Column({ type: 'decimal', nullable: true })
  amount?: number;


  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'varchar', length: 20 })
  status: string;

  @Column({ type: 'varchar', length: 50, nullable: true }) // Nullable to avoid errors on existing rows
  order_id?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  invoice_id?: string;

  @Column({ type: 'boolean', default: false }) // Default false to avoid null constraint errors
  international: boolean;

  @Column({ type: 'varchar', length: 30 })
  method: string;

  @Column({ type: 'int', default: 0 })
  amount_refunded: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  refund_status?: string;

  @Column({ type: 'boolean', default: false })
  captured: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  card_id?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  bank?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  wallet?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vpa?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contact?: string;

  @Column({ type: 'int', nullable: true })
  fee?: number;

  @Column({ type: 'int', nullable: true })
  tax?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  error_code?: string;

  @Column({ type: 'text', nullable: true })
  error_description?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  error_source?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  error_step?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  error_reason?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bank_transaction_id?: string;

  @Column({ type: 'bigint', default: 0 }) // Default 0 for existing data safety
  payment_created_at: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
