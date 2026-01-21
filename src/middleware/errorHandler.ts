/**
 * Global Error Handling Middleware
 * Catches all errors and formats consistent error responses
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError, ValidationError, DatabaseError } from '@/src/types/errors';
import { ApiResponse } from '@/src/types';
import { logger } from '@/src/utils/logger';

/**
 * Format error response
 */
function formatErrorResponse(
  error: Error,
  _statusCode: number = 500
): ApiResponse {
  return {
    success: false,
    error: error.message,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Handle Zod validation errors
 */
function handleZodError(error: ZodError): NextResponse {
  const errors = error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

  const validationError = new ValidationError('Validation failed', errors);

  logger.warn({ msg: 'Validation error', errors });

  return NextResponse.json(
    {
      success: false,
      error: validationError.message,
      errors: validationError.errors,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: validationError.statusCode }
  );
}

/**
 * Handle Prisma errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse {
  let message = 'Database operation failed';
  let statusCode = 500;

  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      message = 'A record with this value already exists';
      statusCode = 409;
      break;
    case 'P2025':
      // Record not found
      message = 'Record not found';
      statusCode = 404;
      break;
    case 'P2003':
      // Foreign key constraint violation
      message = 'Related record not found';
      statusCode = 400;
      break;
    case 'P2014':
      // Invalid ID
      message = 'Invalid ID provided';
      statusCode = 400;
      break;
    default:
      message = 'Database operation failed';
      statusCode = 500;
  }

  const dbError = new DatabaseError(message);
  
  logger.error({
    msg: 'Prisma error',
    code: error.code,
    meta: error.meta,
    message: error.message,
  });

  return NextResponse.json(
    formatErrorResponse(dbError, statusCode),
    { status: statusCode }
  );
}

/**
 * Handle application errors
 */
function handleAppError(error: AppError): NextResponse {
  // Log operational errors as warnings, programming errors as errors
  if (error.isOperational) {
    logger.warn({
      msg: 'Operational error',
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
    });
  } else {
    logger.error({
      msg: 'Programming error',
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
    });
  }

  return NextResponse.json(
    formatErrorResponse(error, error.statusCode),
    { status: error.statusCode }
  );
}

/**
 * Handle unknown errors
 */
function handleUnknownError(error: Error): NextResponse {
  logger.error({
    msg: 'Unknown error',
    message: error.message,
    stack: error.stack,
  });

  return NextResponse.json(
    formatErrorResponse(new Error('Internal server error'), 500),
    { status: 500 }
  );
}

/**
 * Main error handler
 * Determines error type and delegates to appropriate handler
 */
export function errorHandler(error: unknown): NextResponse {
  // Zod validation errors
  if (error instanceof ZodError) {
    return handleZodError(error);
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  // Application errors
  if (error instanceof AppError) {
    return handleAppError(error);
  }

  // Unknown errors
  if (error instanceof Error) {
    return handleUnknownError(error);
  }

  // Fallback for non-Error objects
  logger.error({ msg: 'Non-Error object thrown', error });
  return NextResponse.json(
    formatErrorResponse(new Error('An unexpected error occurred'), 500),
    { status: 500 }
  );
}

/**
 * Async error wrapper for route handlers
 * Catches async errors and passes them to error handler
 */
export function asyncHandler<T = any>(
  handler: (req: Request, context: T) => Promise<any>
) {
  return async (req: Request, context: any): Promise<NextResponse<unknown>> => {
    try {
      const response = await handler(req, context);
      if (!response) {
        throw new Error('Handler returned undefined response');
      }
      return response;
    } catch (error) {
      return errorHandler(error);
    }
  };
}
