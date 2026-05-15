/**
 * Next.js instrumentation hook — runs once on server startup.
 * Used for graceful shutdown and APM setup.
 * Only executes in Node.js runtime, never in Edge.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { dbPool } = await import('./lib/db');
    const logger = (await import('./lib/logger')).default;

    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, draining database pool');
      await dbPool.end();
      process.exit(0);
    });
  }
}
