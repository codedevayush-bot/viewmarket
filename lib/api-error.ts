import { NextResponse } from 'next/server';
import logger from './logger';

/**
 * Standard API error class for consistent error responses.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Create a standardized error response from any thrown error.
 * Logs the error and returns a safe response to the client.
 */
export function errorResponse(error: unknown, context?: string): NextResponse {
  if (error instanceof ApiError) {
    logger.warn(
      { code: error.code, status: error.status, context },
      error.message
    );
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  const message = error instanceof Error ? error.message : 'Unknown error';
  logger.error({ error: message, context }, 'Unhandled error in API route');

  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL' },
    { status: 500 }
  );
}
