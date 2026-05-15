import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbPool } from '@/lib/db';
import { validateRequest, schemas } from '@/lib/validate';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/api-error';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit
  const rateLimitResponse = rateLimit(
    `ticket-msg:${session.user.id}`,
    RATE_LIMITS.tickets
  );
  if (rateLimitResponse) return rateLimitResponse;

  const client = await dbPool.connect();
  try {
    const { id } = await params;

    const validation = await validateRequest(req, schemas.ticketMessage);
    if (!validation.success) return validation.response;

    const { message } = validation.data;

    // Verify ticket access
    const ticketResult = await client.query(
      `SELECT user_id FROM tickets WHERE id = $1`,
      [id]
    );
    if (ticketResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ticket not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const ticket = ticketResult.rows[0];
    if (session.user.role !== 'admin' && ticket!.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    await client.query('BEGIN');

    const messageResult = await client.query(
      `INSERT INTO ticket_messages (ticket_id, sender_id, message)
       VALUES ($1, $2, $3)
       RETURNING id, created_at`,
      [id, session.user.id, message]
    );

    const messageId = messageResult.rows[0]?.id;

    await client.query(`UPDATE tickets SET updated_at = NOW() WHERE id = $1`, [
      id,
    ]);

    await client.query('COMMIT');
    return NextResponse.json({ success: true, messageId }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    return errorResponse(error, 'ticket-message');
  } finally {
    client.release();
  }
}
