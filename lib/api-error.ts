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

  let message = 'Unknown error';
  let stack: string | undefined;

  if (error instanceof Error) {
    message = error.message;
    stack = error.stack;
  } else if (typeof error === 'string') {
    message = error;
  } else if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    message =
      (obj.message as string) || (obj.error as string) || JSON.stringify(error);
    stack = obj.stack as string | undefined;
  }

  logger.error(
    { error: message, stack, context },
    'Unhandled error in API route'
  );

  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL' },
    { status: 500 }
  );
}
