import { Pool } from '@neondatabase/serverless';

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
  console.warn(
    'DATABASE_URL is missing. This is expected during build but will cause errors in production.'
  );
}

export const dbPool = new Pool({ connectionString });

// Helper to execute queries with automatic client release
export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  try {
    const res = await dbPool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DB DEBUG] Executed query', {
        text,
        duration,
        rows: res.rowCount,
      });
    }
    return res;
  } catch (error) {
    console.error('[DB ERROR] Query failed', { text, error });
    throw error;
  }
}
