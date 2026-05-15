import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';
import { BrokerFactory } from '@/lib/brokers/BrokerFactory';
import { decrypt } from '@/lib/encryption';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/api-error';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit financial operations
  const rateLimitResponse = rateLimit(
    `broker-test:${session.user.id}`,
    RATE_LIMITS.financial
  );
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const { connectionId } = body;

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Missing connectionId', code: 'VALIDATION_ERROR' },
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

    const encryptedCredentials = {
      api_key: connection.api_key ? decrypt(connection.api_key) : undefined,
      api_secret: connection.api_secret
        ? decrypt(connection.api_secret)
        : undefined,
      ...(connection.encrypted_credentials || {}),
    };

    const sessionData = {
      access_token: connection.access_token
        ? decrypt(connection.access_token)
        : undefined,
      ...(connection.session_data || {}),
    };

    const adapter = BrokerFactory.createAdapter(
      connection.broker_name,
      encryptedCredentials,
      sessionData
    );

    const profile = await adapter.getProfile();
    const funds = await adapter.getFunds();

    return NextResponse.json({ success: true, profile, funds });
  } catch (error) {
    return errorResponse(error, 'broker-test');
  }
}
