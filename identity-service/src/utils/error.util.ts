import { RpcException } from '@nestjs/microservices';
import { HttpException, Logger } from '@nestjs/common';


type AppError = 
  | HttpException
  | Error
  | {
      name: string;
      message: string | string[];
      code?: number;
      errors?: Record<string, any>;
      stack?: string;
    };

// Ensure Error interface includes optional properties
interface Error {
  name: string;
  message: string;
  stack?: string;
  code?: number;
  errors?: Record<string, any>;
}

const logger = new Logger('ErrorUtil');


export function successResponse(data: any, message = 'Success') {
  return {
    success: true,
    message,
    data,
  };
}


export function errorResponse(
  error: AppError,
  defaultMessage = 'Unexpected error occurred',
  defaultStatus = 500,
  isMicroservice = true
): RpcException | HttpException {
  let statusCode = defaultStatus;
  let message: string = defaultMessage;
  let errorType = 'InternalError';

  // Normalize message to string
  const normalizeMessage = (msg: string | string[]): string => {
    return Array.isArray(msg) ? msg.join(', ') : msg;
  };

  if (error instanceof HttpException) {
    const res = error.getResponse();
    statusCode = error.getStatus();
    if (typeof res === 'string') {
      message = res;
    } else if (typeof res === 'object') {
      message = normalizeMessage((res as any).message || defaultMessage);
    }
    errorType = error.name || 'HttpException';
  } else if (error?.name === 'NotFoundError' || error?.message?.includes('not found')) {
    statusCode = 404;
    message = normalizeMessage(error.message || 'Resource not found');
    errorType = 'NotFoundError';
  } else if (error?.name === 'ForbiddenError' || error?.message?.includes('forbidden')) {
    statusCode = 403;
    message = normalizeMessage(error.message || 'Access forbidden');
    errorType = 'ForbiddenError';
  } else if (error?.name === 'ValidationError') {
    statusCode = 400;
    message = normalizeMessage(error.message || 'Validation failed');
    if (error.errors) {
      message = normalizeMessage(
        Object.values(error.errors)
          .map((err: any) => err.message || 'Invalid input')
          .join(', ')
      );
    }
    errorType = 'ValidationError';
  } else if (error?.name === 'MongoError') {
    if (error.code === 11000) {
      statusCode = 409;
      message = 'Duplicate key error';
      errorType = 'MongoDuplicateKeyError';
    } else {
      statusCode = 503;
      message = 'Database error';
      errorType = 'MongoError';
    }
  } else if (error?.name === 'RedisError') {
    statusCode = 503;
    message = 'Redis service unavailable';
    errorType = 'RedisError';
  } else if (error?.name === 'KafkaError' || error?.name === 'KafkaJSError') {
    statusCode = 503;
    message = 'Messaging service error';
    errorType = 'KafkaError';
  } else if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
    statusCode = 401;
    message = normalizeMessage(error.message || 'Invalid or expired token');
    errorType = 'AuthError';
  } else if (error?.name === 'TimeoutError') {
    statusCode = 504;
    message = 'Request timed out';
    errorType = 'TimeoutError';
  } else if (error?.name === 'RateLimitError') {
    statusCode = 429;
    message = 'Too many requests';
    errorType = 'RateLimitError';
  } else if (error?.name === 'NetworkError') {
    statusCode = 502;
    message = 'Network error occurred';
    errorType = 'NetworkError';
  } else if (error instanceof Error) {
    message = normalizeMessage(error.message || defaultMessage);
    errorType = error.name || 'Error';
  }

  // Log the error with stack trace
  logger.error(`Error: ${errorType} - ${message}`, error.stack ?? '');

  // Include stack trace in development mode
  const isDev = process.env.NODE_ENV === 'development';
  const errorPayload = {
    status: false,
    statusCode,
    message,
    error: errorType,
    ...(isDev && error.stack && { stack: error.stack }),
  };

  return isMicroservice
    ? new RpcException(errorPayload)
    : new HttpException(errorPayload, statusCode);
}