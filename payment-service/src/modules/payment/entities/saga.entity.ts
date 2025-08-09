// /home/satya/myproject/payment-service/src/modules/payment/entities/saga.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

export enum SagaStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    COMPENSATING = 'compensating',
    COMPENSATED = 'compensated',
    FAILED = 'failed',
}

export enum SagaStepStatus {
    PENDING = 'pending',
    EXECUTING = 'executing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    COMPENSATING = 'compensating',
    COMPENSATED = 'compensated',
}

export enum SagaStepType {
    INVENTORY_RESERVE = 'inventory_reserve',
    ORDER_CREATE = 'order_create',
    PAYMENT_PROCESS = 'payment_process',
    INVENTORY_CONFIRM = 'inventory_confirm',
    ORDER_CONFIRM = 'order_confirm',
    NOTIFICATION_SEND = 'notification_send',
}

@Entity('sagas')
export class Saga {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    saga_id: string;

    @Column({ type: 'enum', enum: SagaStatus, default: SagaStatus.PENDING })
    status: SagaStatus;

    @Column('json')
    payload: any;

    @Column('json', { nullable: true })
    context: any;

    @Column()
    user_id: number;

    @Column({ nullable: true })
    razorpay_order_id?: string;

    @Column({ nullable: true })
    payment_id?: string;

    @Column({ type: 'text', nullable: true })
    error_message?: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => SagaStep, step => step.saga)
    steps: SagaStep[];
}

@Entity('saga_steps')
export class SagaStep {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    saga_id: string;

    @Column({ type: 'enum', enum: SagaStepType })
    step_type: SagaStepType;

    @Column({ type: 'enum', enum: SagaStepStatus, default: SagaStepStatus.PENDING })
    status: SagaStepStatus;

    @Column()
    step_order: number;

    @Column('json', { nullable: true })
    input_data: any;

    @Column('json', { nullable: true })
    output_data: any;

    @Column('json', { nullable: true })
    compensation_data: any;

    @Column({ type: 'text', nullable: true })
    error_message?: string;

    @Column({ type: 'int', default: 0 })
    retry_count: number;


    @Column({ type: 'int', default: 3 })
    max_retries: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => Saga, saga => saga.steps)
    @JoinColumn({ name: 'saga_id', referencedColumnName: 'saga_id' })
    saga: Saga;
}