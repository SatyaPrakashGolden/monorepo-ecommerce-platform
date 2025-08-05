import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum SagaStatus {
  STARTED = 'STARTED',
  COMPENSATING = 'COMPENSATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATION_FAILED = 'COMPENSATION_FAILED',
  CANCELLED = 'CANCELLED'
}

export enum SagaStepStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED',
  COMPENSATION_FAILED = 'COMPENSATION_FAILED',
  SKIPPED = 'SKIPPED'
}

@Entity('saga_transactions')
@Index(['status', 'createdAt'])
@Index(['sagaType', 'status'])
export class SagaTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  sagaId: string;

  @Column()
  sagaType: string;

  @Column({ type: 'enum', enum: SagaStatus })
  status: SagaStatus;

  @Column('json')
  payload: any;

  @Column({ default: 0 })
  currentStep: number;

  @Column()
  totalSteps: number;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  timeoutAt: Date;

  @Column({ default: 0 })
  version: number; // For optimistic locking

  @Column({ nullable: true })
  parentSagaId: string; // For nested sagas

  @Column('json', { nullable: true })
  context: any; // Additional saga context

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('saga_steps')
@Index(['sagaId', 'stepOrder'])
@Index(['status', 'createdAt'])
export class SagaStep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sagaId: string;

  @Column()
  stepName: string;

  @Column()
  stepOrder: number;

  @Column({ type: 'enum', enum: SagaStepStatus })
  status: SagaStepStatus;

  @Column('json', { nullable: true })
  stepData: any;

  @Column('json', { nullable: true })
  inputData: any; // Input parameters for the step

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ default: 0 })
  maxRetries: number;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  timeoutAt: Date;

  @Column({ default: 5000 })
  timeoutDuration: number;

  @Column({ default: false })
  isAsync: boolean;

  @Column({ default: false })
  isCompensatable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}