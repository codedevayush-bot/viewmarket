import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';
import { encrypt } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { broker_id, account_id, credentials = {} } = body;

    // Backward compatibility: if api_key/api_secret are sent directly, add them to credentials
    if (body.api_key && !credentials.api_key)
      credentials.api_key = body.api_key;
    if (body.api_secret && !credentials.api_secret)
      credentials.api_secret = body.api_secret;

    if (!broker_id || !account_id || Object.keys(credentials).length === 0) {
      return NextResponse.json(
        { error: 'Missing broker_id, account_id, or credentials' },
        { status: 400 }
      );
    }

    // Encrypt all sensitive data in the credentials object
    const encryptedCredentials: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(credentials)) {
      if (typeof value === 'string') {
        encryptedCredentials[key] = encrypt(value);
      } else {
        encryptedCredentials[key] = value;
      }
    }

    // Legacy fields for backward compatibility during migration
    const legacyKey = encryptedCredentials.api_key || '';
    const legacySecret = encryptedCredentials.api_secret || '';

    // Upsert the connection for the user and broker
    const res = await query(
      `INSERT INTO broker_connections ("userId", "brokerId", account_id, api_key, api_secret, encrypted_credentials, is_valid)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       ON CONFLICT ("userId", "brokerId", account_id)
       DO UPDATE SET 
         api_key = EXCLUDED.api_key, 
         api_secret = EXCLUDED.api_secret, 
         encrypted_credentials = EXCLUDED.encrypted_credentials,
         is_valid = true, 
         "updatedAt" = NOW()
       RETURNING id`,
      [
        session.user.id,
        broker_id,
        account_id,
        legacyKey,
        legacySecret,
        encryptedCredentials,
      ]
    );

    return NextResponse.json({
      success: true,
      connectionId: res.rows[0].id,
      message: 'Broker credentials saved successfully.',
    });
  } catch (error) {
    console.error('Failed to connect broker:', error);
    return NextResponse.json(
      { error: 'Failed to connect broker' },
      { status: 500 }
    );
  }
}
