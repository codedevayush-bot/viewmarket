import pino from 'pino';

const logger = pino({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  base: undefined, // No pid/hostname in every log line
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Create a child logger with request context.
 * Use in API route handlers for distributed tracing.
 */
export function createRequestLogger(requestId: string, userId?: string) {
  return logger.child({ requestId, userId });
}

export default logger;
