/**
 * Global Error Handling Middleware
 * Catches all errors and formats consistent error responses
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '@/src/types/errors';

/**
 * Handle Zod validation errors
 */
function handleZodError(error: ZodError): NextResponse {
  try {
    const errors = error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    console.warn({ msg: 'Validation error', errors });

    return NextResponse.json(
      {
        success: false,
        error: 'validation_error',
        message: 'Validation failed',
        errors: errors,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    );
  } catch (handlerError) {
    console.error({ msg: 'Failed to handle Zod error', handlerError });
    return NextResponse.json(
      {
        success: false,
        error: 'validation_error',
        message: 'Validation failed',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    );
  }
}

/**
 * Handle Prisma errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse {
  try {
    let message = 'Database operation failed';
    let statusCode = 500;
    let errorCode = 'database_error';

    switch (error.code) {
      case 'P2002':
        message = 'A record with this value already exists';
        statusCode = 409;
        errorCode = 'conflict';
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = 404;
        errorCode = 'not_found';
        break;
      case 'P2003':
        message = 'Related record not found';
        statusCode = 400;
        errorCode = 'bad_request';
        break;
      case 'P2014':
        message = 'Invalid ID provided';
        statusCode = 400;
        errorCode = 'bad_request';
        break;
      default:
        message = 'Database operation failed';
        statusCode = 500;
        errorCode = 'database_error';
    }

    console.error({
      msg: 'Prisma error',
      code: error.code,
      meta: error.meta,
      message: error.message,
    });

    return NextResponse.json(
      {
        success: false,
        error: errorCode,
        message: message,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: statusCode }
    );
  } catch (handlerError) {
    console.error({ msg: 'Failed to handle Prisma error', handlerError });
    return NextResponse.json(
      {
        success: false,
        error: 'database_error',
        message: 'Database operation failed',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Handle application errors
 */
function handleAppError(error: AppError): NextResponse {
  try {
    // Log operational errors as warnings, programming errors as errors
    if (error.isOperational) {
      console.warn({
        msg: 'Operational error',
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
      });
    } else {
      console.error({
        msg: 'Programming error',
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack,
      });
    }

    const response: any = {
      success: false,
      error: error.name.replace('Error', '').toLowerCase(),
      message: error.message,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    // Add validation errors if present
    if ('errors' in error && Array.isArray((error as any).errors)) {
      response.errors = (error as any).errors;
    }

    // Add retry-after header for rate limit errors
    const headers: HeadersInit = {};
    if ('retryAfter' in error) {
      headers['Retry-After'] = String((error as any).retryAfter);
    }

    return NextResponse.json(response, { 
      status: error.statusCode,
      headers: Object.keys(headers).length > 0 ? headers : undefined
    });
  } catch (handlerError) {
    console.error({ msg: 'Failed to handle AppError', handlerError });
    return NextResponse.json(
      {
        success: false,
        error: 'internal_error',
        message: 'An error occurred',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Handle unknown errors
 */
function handleUnknownError(error: Error): NextResponse {
  try {
    console.error({
      msg: 'Unknown error',
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'internal_error',
        message: error.message || 'Internal server error',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  } catch (handlerError) {
    console.error({ msg: 'Failed to handle unknown error', handlerError });
    return NextResponse.json(
      {
        success: false,
        error: 'internal_error',
        message: 'Internal server error',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Main error handler
 * Determines error type and delegates to appropriate handler
 * CRITICAL: Never throws, always returns a valid NextResponse
 */
export function errorHandler(error: unknown): NextResponse {
  try {
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
    console.error({ msg: 'Non-Error object thrown', error });
    return NextResponse.json(
      {
        success: false,
        error: 'unexpected_error',
        message: 'An unexpected error occurred',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  } catch (handlerError) {
    // Ultimate fallback if error handling itself fails
    console.error({ 
      msg: 'Critical: Error handler failed',
      originalError: error,
      handlerError: handlerError instanceof Error ? handlerError.message : String(handlerError)
    });
    
    return NextResponse.json(
      {
        success: false,
        error: 'critical_error',
        message: 'A critical error occurred',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Async error wrapper for route handlers
 * Catches async errors and passes them to error handler
 * CRITICAL: Always returns a valid NextResponse to prevent build cache corruption
 * 
 * Next.js 15 compatible - handles both simple routes and routes with context
 */
export function asyncHandler<T = any>(
  handler: (req: Request, context?: T) => Promise<NextResponse>
): (req: Request, context?: T) => Promise<NextResponse> {
  return async (req: Request, context?: T): Promise<NextResponse> => {
    try {
      // Execute the handler with proper context handling
      const response = await handler(req, context);
      
      // Validate response exists
      if (!response) {
        console.error({ 
          msg: 'Handler returned undefined response',
          url: req.url,
          method: req.method 
        });
        
        return NextResponse.json(
          {
            success: false,
            error: 'internal_error',
            message: 'Handler returned undefined response',
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
          { status: 500 }
        );
      }

      // Validate response is a NextResponse
      if (!(response instanceof NextResponse)) {
        console.error({ 
          msg: 'Handler returned invalid response type',
          url: req.url,
          method: req.method,
          responseType: typeof response
        });
        
        return NextResponse.json(
          {
            success: false,
            error: 'internal_error',
            message: 'Invalid response type from handler',
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
          { status: 500 }
        );
      }

      return response;
    } catch (error) {
      // Log the error with context
      console.error({ 
        msg: 'Error caught in asyncHandler',
        url: req.url,
        method: req.method,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : String(error)
      });
      
      // Always return a valid response, never throw
      try {
        return errorHandler(error);
      } catch (handlerError) {
        // Fallback if error handler itself fails
        console.error({ 
          msg: 'Error handler failed',
          handlerError: handlerError instanceof Error ? handlerError.message : String(handlerError)
        });
        
        return NextResponse.json(
          {
            success: false,
            error: 'critical_error',
            message: 'An unexpected error occurred',
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
          { status: 500 }
        );
      }
    }
  };
}
