import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { BrokerFactory } from '@/lib/brokers/BrokerFactory';
import { decrypt, encrypt } from '@/lib/encryption';

// Configures this route to be executed on a serverless edge or node environment
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max duration

export async function GET(req: NextRequest) {
  // Simple authentication for cron jobs (e.g. from Vercel Cron or AWS EventBridge)
  const authHeader = req.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Fetch all active connections that have an access token
    const res = await query(`
      SELECT bc.*, b.name as broker_name 
      FROM broker_connections bc
      JOIN brokers b ON bc."brokerId" = b.id
      WHERE bc.is_valid = true AND bc.access_token IS NOT NULL
    `);

    const now = new Date();
    const results = { refreshed: 0, expired: 0, skipped: 0, failed: 0 };

    interface ConnectionRow {
      id: string;
      broker_name: string;
      api_key?: string;
      api_secret?: string;
      access_token?: string;
      refresh_token?: string;
      token_expires_at?: string;
      is_valid: boolean;
    }

    for (const connection of res.rows as unknown as ConnectionRow[]) {
      try {
        const expiresAt = connection.token_expires_at
          ? new Date(connection.token_expires_at)
          : null;

        // Process if expired or expiring within 30 minutes
        if (expiresAt && expiresAt.getTime() - now.getTime() < 30 * 60 * 1000) {
          const credentials = {
            api_key: connection.api_key ? decrypt(connection.api_key) : '',
            api_secret: connection.api_secret
              ? decrypt(connection.api_secret)
              : '',
            client_id: connection.api_key ? decrypt(connection.api_key) : '',
            client_secret: connection.api_secret
              ? decrypt(connection.api_secret)
              : '',
            redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/brokers/callback`,
          };

          const adapter = BrokerFactory.createAdapter(
            connection.broker_name,
            credentials
          );

          if (adapter.refreshToken && connection.refresh_token) {
            // Attempt to refresh
            const currentRefreshToken = decrypt(connection.refresh_token);
            const authResult = await adapter.refreshToken(currentRefreshToken);

            if (authResult.success && authResult.accessToken) {
              const newEncryptedAccess = encrypt(authResult.accessToken);
              const newEncryptedRefresh = authResult.refreshToken
                ? encrypt(authResult.refreshToken)
                : connection.refresh_token;

              let newExpiresAt = new Date();
              newExpiresAt.setHours(newExpiresAt.getHours() + 24);
              if (authResult.expiresAt) newExpiresAt = authResult.expiresAt;

              await query(
                `
                UPDATE broker_connections 
                SET access_token = $1, refresh_token = $2, token_expires_at = $3, "updatedAt" = NOW()
                WHERE id = $4
              `,
                [
                  newEncryptedAccess,
                  newEncryptedRefresh,
                  newExpiresAt.toISOString(),
                  connection.id,
                ]
              );

              results.refreshed++;
            } else {
              // Refresh failed, mark as invalid
              await query(
                `UPDATE broker_connections SET is_valid = false WHERE id = $1`,
                [connection.id]
              );
              results.expired++;
            }
          } else {
            // Broker doesn't support refresh tokens or no refresh token available
            // Mark the connection as requiring manual re-authentication
            await query(
              `UPDATE broker_connections SET is_valid = false WHERE id = $1`,
              [connection.id]
            );
            results.expired++;
          }
        } else {
          results.skipped++;
        }
      } catch (err) {
        console.error(`Failed to process connection ${connection.id}:`, err);
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error: unknown) {
    console.error('Cron token refresh failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
