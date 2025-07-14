import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

// Define a union type for better type safety
type AppError = 
  | HttpException
  | RpcException
  | Error
  | {
      name: string;
      message: string | string[];
      code?: number;
      errors?: Record<string, any>;
      stack?: string;
      statusCode?: number;
    };


interface Error {
  name: string;
  message: string;
  stack?: string;
  code?: number;
  errors?: Record<string, any>;
  statusCode?: number;
}

const logger = new Logger('ErrorUtil');


export function successResponse(
  data: any,
  message = 'Success',
  total?: number,
  totalPages?: number,
  currentPage?: number
) {
  const response: any = {
    success: true,
    message,
    data,
  };

  if (typeof total === 'number') {
    response.total = total;
  }
  if (typeof totalPages === 'number') {
    response.totalPages = totalPages;
  }
  if (typeof currentPage === 'number') {
    response.currentPage = currentPage;
  }

  return response;
}


export function errorResponseGateway(
  error: AppError,
  defaultMessage = 'Something went wrong',
  defaultStatusCode = 500
) {
  const statusCode = mapStatusCode(error) || defaultStatusCode;
  const message = normalizeMessage(error?.message || defaultMessage);
  const errorType = error?.name || 'InternalError';

  // Log the error with stack trace
  logger.error(`Error: ${errorType} - ${message}`, error.stack ?? '');

  return {
    success: false,
    statusCode,
    message,
    error: errorType,
    ...(process.env.NODE_ENV === 'development' && error.stack && { stack: error.stack }),
  };
}

export function throwHttpFormattedError(
  error: AppError,
  defaultMessage = 'Something went wrong'
): never {
  const errorResponse = errorResponseGateway(error, defaultMessage);
  throw new HttpException(errorResponse, errorResponse.statusCode);
}

function mapStatusCode(error: AppError): number {
  const message = normalizeMessage(error?.message || '').toLowerCase();

  // Handle RpcException specifically
  if (error instanceof RpcException) {
    const errorObj = error.getError();
    if (typeof errorObj === 'object' && errorObj !== null && 'statusCode' in errorObj) {
      // Validate that statusCode is a number
      const statusCode = errorObj.statusCode;
      if (typeof statusCode === 'number') {
        return statusCode;
      }
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  // Handle statusCode for custom error objects
  const statusCode = (typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number') 
    ? error.statusCode 
    : HttpStatus.INTERNAL_SERVER_ERROR;

  if (error instanceof HttpException) {
    return error.getStatus();
  }
  if (message.includes('not found') || error?.name === 'NotFoundError') {
    return HttpStatus.NOT_FOUND;
  }
  if (
    message.includes('cast to objectid') ||
    message.includes('validation failed') ||
    message.includes('must be') ||
    error?.name === 'ValidationError'
  ) {
    return HttpStatus.BAD_REQUEST;
  }
  if (message.includes('duplicate key') || error?.code === 11000) {
    return HttpStatus.CONFLICT;
  }
  if (message.includes('unauthorized') || error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
    return HttpStatus.UNAUTHORIZED;
  }
  if (message.includes('forbidden') || error?.name === 'ForbiddenError') {
    return HttpStatus.FORBIDDEN;
  }
  if (error?.name === 'TimeoutError') {
    return HttpStatus.GATEWAY_TIMEOUT;
  }
  if (error?.name === 'RateLimitError') {
    return HttpStatus.TOO_MANY_REQUESTS;
  }
  if (error?.name === 'NetworkError' || error?.name === 'RedisError' || error?.name === 'KafkaError') {
    return HttpStatus.SERVICE_UNAVAILABLE;
  }
  return statusCode;
}

function normalizeMessage(msg: string | string[]): string {
  return Array.isArray(msg) ? msg.join(', ') : msg;
}