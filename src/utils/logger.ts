/**
 * Logger Utility using Pino
 * Provides structured logging with different log levels
 */

import pino from 'pino';
import { env } from '@/src/config/env';

/**
 * Create logger instance with appropriate configuration
 */
export const logger = pino({
  level: env.isDevelopment() ? 'debug' : 'info',
  transport: env.isDevelopment()
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Create child logger with additional context
 */
export function createLogger(context: Record<string, unknown>): pino.Logger {
  return logger.child(context);
}

/**
 * Log request information
 */
export function logRequest(
  method: string,
  url: string,
  userId?: string
): void {
  logger.info({
    type: 'request',
    method,
    url,
    userId,
  });
}

/**
 * Log response information
 */
export function logResponse(
  method: string,
  url: string,
  statusCode: number,
  duration: number
): void {
  logger.info({
    type: 'response',
    method,
    url,
    statusCode,
    duration,
  });
}

/**
 * Log error with context
 */
export function logError(
  error: Error,
  context?: Record<string, unknown>
): void {
  logger.error({
    type: 'error',
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

export default logger;
