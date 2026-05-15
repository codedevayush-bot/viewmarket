import { dbPool } from '@/lib/db';
import logger from '@/lib/logger';

export async function GET() {
  try {
    await dbPool.query('SELECT 1');
    return Response.json(
      { status: 'healthy', db: 'connected' },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ err: error }, 'Health check failed');
    return Response.json(
      {
        status: 'unhealthy',
        db: 'disconnected',
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
