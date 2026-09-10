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
/**
 * pino-pretty runs in a worker thread, which breaks under Next's bundling on
 * serverless. Only load it in local development on the Node runtime; in
 * production we emit plain structured JSON to stdout, which is what Vercel's
 * live tail reads.
 *
 * Note this is the real-time view only. The durable record is EventLogService,
 * which writes to the event_logs table.
 */
const usePrettyTransport =
  env.isDevelopment() &&
  typeof process !== 'undefined' &&
  process.env.NEXT_RUNTIME !== 'edge';

export const logger = pino({
  level: env.isDevelopment() ? 'debug' : 'info',
  transport: usePrettyTransport
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
    logger.info({ type: 'request', method, url, userId }, `${method} ${url}`);
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
    logger.info(
      { type: 'response', method, url, statusCode, duration },
      `${method} ${url} → ${statusCode} (${duration}ms)`
    );
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

    logger.error({ type: 'error', err: error, ...safeContext }, error.message);
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
