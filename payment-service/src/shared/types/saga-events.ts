// shared/types/saga-events.ts
export interface SagaEvent {
  sagaId: string;
  timestamp: number;
  correlationId: string;
  version: number;
}

export interface OrderCreationStartedEvent extends SagaEvent {
  type: 'ORDER_CREATION_STARTED';
  payload: {
    userId: number;
    productId: string;
    amount: number;
    currency: string;
  };
}

export interface OrderCreatedEvent extends SagaEvent {
  type: 'ORDER_CREATED';
  payload: {
    orderId: number;
    razorpayOrderId: string;
    userId: number;
    productId: string;
    amount: number;
    currency: string;
    receipt: string;
  };
}

export interface OrderCreationFailedEvent extends SagaEvent {
  type: 'ORDER_CREATION_FAILED';
  payload: {
    userId: number;
    productId: string;
    amount: number;
    reason: string;
    error: any;
  };
}

export interface PaymentProcessingStartedEvent extends SagaEvent {
  type: 'PAYMENT_PROCESSING_STARTED';
  payload: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature?: string;
    isFailedPayment: boolean;
  };
}

export interface PaymentVerifiedEvent extends SagaEvent {
  type: 'PAYMENT_VERIFIED';
  payload: {
    paymentId: number;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    amount: number;
    status: string;
  };
}

export interface PaymentFailedEvent extends SagaEvent {
  type: 'PAYMENT_FAILED';
  payload: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    amount: number;
    errorCode?: string;
    errorDescription?: string;
    status: string;
  };
}

export interface OrderCompletedEvent extends SagaEvent {
  type: 'ORDER_COMPLETED';
  payload: {
    orderId: number;
    razorpayOrderId: string;
    paymentId: number;
    userId: number;
    amount: number;
    status: 'SUCCESS';
  };
}

export interface OrderFailedEvent extends SagaEvent {
  type: 'ORDER_FAILED';
  payload: {
    orderId: number;
    razorpayOrderId: string;
    userId: number;
    amount: number;
    reason: string;
    status: 'FAILED';
  };
}

export interface PaymentReversalRequestedEvent extends SagaEvent {
  type: 'PAYMENT_REVERSAL_REQUESTED';
  payload: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    amount: number;
    reason: string;
  };
}

export interface PaymentReversedEvent extends SagaEvent {
  type: 'PAYMENT_REVERSED';
  payload: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    refundId: string;
    amount: number;
    status: string;
  };
}

export interface OrderCancellationRequestedEvent extends SagaEvent {
  type: 'ORDER_CANCELLATION_REQUESTED';
  payload: {
    razorpayOrderId: string;
    reason: string;
  };
}

export type SagaEventType = 
  | OrderCreationStartedEvent
  | OrderCreatedEvent
  | OrderCreationFailedEvent
  | PaymentProcessingStartedEvent
  | PaymentVerifiedEvent
  | PaymentFailedEvent
  | OrderCompletedEvent
  | OrderFailedEvent
  | PaymentReversalRequestedEvent
  | PaymentReversedEvent
  | OrderCancellationRequestedEvent;