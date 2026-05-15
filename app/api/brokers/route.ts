import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';
import { errorResponse } from '@/lib/api-error';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await query('SELECT * FROM brokers WHERE is_active = true');
    return NextResponse.json({ brokers: res.rows });
  } catch (error) {
    return errorResponse(error, 'brokers-list');
  }
}
