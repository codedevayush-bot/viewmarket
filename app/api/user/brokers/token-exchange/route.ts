import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';
import { BrokerFactory } from '@/lib/brokers/BrokerFactory';
import { decrypt, encrypt } from '@/lib/encryption';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/api-error';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit financial operations
  const rateLimitResponse = rateLimit(
    `token-exchange:${session.user.id}`,
    RATE_LIMITS.financial
  );
  if (rateLimitResponse) return rateLimitResponse;

  const log = logger.child({
    userId: session.user.id,
    action: 'token-exchange',
  });

  try {
    const body = await req.json();
    const { connectionId, requestToken } = body;

    if (!connectionId || !requestToken) {
      return NextResponse.json(
        {
          error: 'Missing connectionId or requestToken',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const res = await query(
      `SELECT bc.*, b.name as broker_name
       FROM broker_connections bc
       JOIN brokers b ON bc."brokerId" = b.id
       WHERE bc.id = $1 AND bc."userId" = $2`,
      [connectionId, session.user.id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json(
        { error: 'Connection not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const connection = res.rows[0]!;

    // Decrypt API credentials
    const credentials = {
      api_key: connection.api_key ? decrypt(connection.api_key) : '',
      api_secret: connection.api_secret ? decrypt(connection.api_secret) : '',
    };

    const adapter = BrokerFactory.createAdapter(
      connection.broker_name,
      credentials
    );

    const authResult = await adapter.authenticate({ requestToken });

    if (!authResult.success || !authResult.accessToken) {
      return NextResponse.json(
        {
          error: 'Failed to exchange token',
          code: 'TOKEN_EXCHANGE_FAILED',
          message: authResult.message,
        },
        { status: 400 }
      );
    }

    // Encrypt and save the accessToken
    const encryptedAccessToken = encrypt(authResult.accessToken);

    let expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    if (authResult.expiresAt) expiresAt = authResult.expiresAt;

    await query(
      `UPDATE broker_connections
       SET access_token = $1, token_expires_at = $2, is_valid = true, "updatedAt" = NOW()
       WHERE id = $3`,
      [encryptedAccessToken, expiresAt.toISOString(), connection.id]
    );

    log.info(
      { connectionId, broker: connection.broker_name },
      'Token exchanged successfully'
    );

    return NextResponse.json({
      success: true,
      message: 'Token exchanged successfully',
    });
  } catch (error) {
    return errorResponse(error, 'token-exchange');
  }
}
