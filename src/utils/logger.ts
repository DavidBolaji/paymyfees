/**
 * Logger Utility using Pino
 * Provides structured logging with different log levels
 */

import pino from 'pino';
import { env } from '@/src/config/env';

// Custom serializer to handle circular references
const safeSerializers = {
  // Handle potential circular references in error objects
  err: (err: Error) => {
    return {
      type: err.constructor.name,
      message: err.message,
      stack: err.stack
    };
  }
};

/**
 * Create logger instance with appropriate configuration
 * Using synchronous logging to avoid worker thread issues
 */
export const logger = pino({
  level: env.isDevelopment() ? 'debug' : 'info',
  // Use synchronous transport to avoid worker thread issues
  transport: env.isDevelopment()
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          sync: true, // Use synchronous logging
        },
      }
    : undefined,
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: safeSerializers,
});

/**
 * Create child logger with additional context
 * Safely handles potential circular references
 */
export function createLogger(context: Record<string, unknown>): pino.Logger {
  try {
    // Try to create a safe copy of the context to avoid circular references
    const safeContext = JSON.parse(JSON.stringify(context));
    return logger.child(safeContext);
  } catch (error) {
    // If serialization fails, create a logger with minimal context
    console.warn(`Failed to serialize logger context: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return logger.child({
      contextError: 'Context omitted due to serialization error',
      contextType: typeof context,
    });
  }
}

/**
 * Log request information
 * Uses safe logging to prevent worker thread issues
 */
export function logRequest(
  method: string,
  url: string,
  userId?: string
): void {
  try {
    console.log({
      type: 'request',
      method,
      url,
      userId,
    });
  } catch (error) {
    // Fallback to basic logging if structured logging fails
    console.log(`Request: ${method} ${url} ${userId ? `User: ${userId}` : ''}`);
  }
}

/**
 * Log response information
 * Uses safe logging to prevent worker thread issues
 */
export function logResponse(
  method: string,
  url: string,
  statusCode: number,
  duration: number
): void {
  try {
    console.log({
      type: 'response',
      method,
      url,
      statusCode,
      duration,
    });
  } catch (error) {
    // Fallback to basic logging if structured logging fails
    console.log(`Response: ${method} ${url} Status: ${statusCode} Duration: ${duration}ms`);
  }
}

/**
 * Log error with context
 * Safely handles circular references and complex objects
 */
export function logError(
  error: Error,
  context?: Record<string, unknown>
): void {
  try {
    // Create a safe copy of the context to avoid circular references
    const safeContext = context ? JSON.parse(JSON.stringify(context)) : {};
    
    console.error({
      type: 'error',
      message: error.message,
      stack: error.stack,
      ...safeContext,
    });
  } catch (serializationError) {
    // If JSON serialization fails, log with minimal context
    console.error({
      type: 'error',
      message: error.message,
      stack: error.stack,
      context: 'Context omitted due to serialization error',
      serializationError: serializationError instanceof Error ? serializationError.message : 'Unknown error',
    });
  }
}

export default logger;
