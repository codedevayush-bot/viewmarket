import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';
import { BrokerFactory } from '@/lib/brokers/BrokerFactory';
import { decrypt } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { connectionId } = await req.json();

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Missing connectionId' },
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
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    const connection = res.rows[0];

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

    // For Zerodha, they might not have an accessToken yet if they only did login but not TOTP / session exchange
    // But testing getProfile will just verify if the access token is valid.
    const profile = await adapter.getProfile();
    const funds = await adapter.getFunds();

    return NextResponse.json({ success: true, profile, funds });
  } catch (error: unknown) {
    console.error('Test connection failed:', error);
    return NextResponse.json(
      {
        error:
          (error instanceof Error ? error.message : String(error)) ||
          'Test connection failed',
      },
      { status: 500 }
    );
  }
}
