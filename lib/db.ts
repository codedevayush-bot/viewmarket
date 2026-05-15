import { Pool } from '@neondatabase/serverless';
import logger from './logger';

const dbLogger = logger.child({ module: 'db' });

/**
 * Enterprise-grade database connection management.
 * Uses a single pool instance to manage connections efficiently across the application.
 */
const connectionString =
  process.env.DATABASE_URL || 'postgres://localhost:5432/dummy';

// Only throw error if we're in production and the URL is actually missing
// During build, we allow the dummy URL to prevent the builder from crashing
if (
  !process.env.DATABASE_URL &&
  process.env.NODE_ENV === 'production' &&
  !process.env.NEXT_RUNTIME
) {
  dbLogger.warn(
    'DATABASE_URL is missing. This is expected during build but will cause errors in production.'
  );
}

export const dbPool = new Pool({ connectionString });

// Pool event listeners for monitoring
dbPool.on('error', (err: Error) => {
  dbLogger.error({ err }, 'Unexpected pool error');
});

// Helper to execute queries with automatic client release
export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  try {
    const res = await dbPool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      dbLogger.warn(
        { text, duration, rows: res.rowCount },
        'Slow query detected'
      );
    } else if (process.env.NODE_ENV !== 'production') {
      dbLogger.debug({ text, duration, rows: res.rowCount }, 'Query executed');
    }
    return res;
  } catch (error) {
    dbLogger.error({ text, err: error }, 'Query failed');
    throw error;
  }
}
