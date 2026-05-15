import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query, dbPool } from '@/lib/db';
import { validateRequest, schemas } from '@/lib/validate';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/api-error';
import logger from '@/lib/logger';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let tickets;
    if (session.user.role === 'admin') {
      let queryStr = `
        SELECT t.*, u.name as user_name, u.email as user_email
        FROM tickets t
        JOIN users u ON t.user_id = u.id
      `;
      const queryParams: unknown[] = [];

      if (status && status !== 'all') {
        queryStr += ` WHERE t.status = $1`;
        queryParams.push(status);
      }

      queryStr += ` ORDER BY t.created_at DESC`;

      const result = await query(queryStr, queryParams);
      tickets = result.rows;
    } else {
      let queryStr = `SELECT * FROM tickets WHERE user_id = $1`;
      const queryParams: unknown[] = [session.user.id];

      if (status && status !== 'all') {
        queryStr += ` AND status = $2`;
        queryParams.push(status);
      }

      queryStr += ` ORDER BY created_at DESC`;

      const result = await query(queryStr, queryParams);
      tickets = result.rows;
    }

    return NextResponse.json(tickets);
  } catch (error) {
    return errorResponse(error, 'tickets-list');
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit ticket creation
  const rateLimitResponse = rateLimit(
    `tickets:${session.user.id}`,
    RATE_LIMITS.tickets
  );
  if (rateLimitResponse) return rateLimitResponse;

  const log = logger.child({
    userId: session.user.id,
    action: 'ticket-create',
  });

  const client = await dbPool.connect();
  try {
    const validation = await validateRequest(req, schemas.ticketCreate);
    if (!validation.success) return validation.response;

    const { title, description, category, attachments } = validation.data;

    await client.query('BEGIN');

    const ticketResult = await client.query(
      `INSERT INTO tickets (user_id, title, description, category)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [session.user.id, title, description, category]
    );

    const ticketId = ticketResult.rows[0]?.id;

    const messageResult = await client.query(
      `INSERT INTO ticket_messages (ticket_id, sender_id, message)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [ticketId, session.user.id, description]
    );

    const messageId = messageResult.rows[0]?.id;

    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        await client.query(
          `INSERT INTO ticket_attachments (message_id, ticket_id, file_name, file_url, file_type, file_size_bytes, file_key)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            messageId,
            ticketId,
            att.fileName,
            att.fileUrl,
            att.fileType,
            att.fileSize,
            att.fileKey,
          ]
        );
      }
    }

    await client.query('COMMIT');

    log.info({ ticketId }, 'Ticket created');

    return NextResponse.json({ id: ticketId }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    return errorResponse(error, 'ticket-create');
  } finally {
    client.release();
  }
}
