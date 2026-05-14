import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { s3Client } from '@/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get ticket details
    const ticketResult = await query(
      `
      SELECT t.*, u.name as user_name, u.email as user_email
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = $1
    `,
      [id]
    );

    if (ticketResult.rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = ticketResult.rows[0];

    // Authorization check
    if (session.user.role !== 'admin' && ticket.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get messages
    const messagesResult = await query(
      `
      SELECT m.*, u.name as sender_name, u.role as sender_role
      FROM ticket_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.ticket_id = $1
      ORDER BY m.created_at ASC
    `,
      [id]
    );

    // Get attachments for these messages
    const attachmentsResult = await query(
      `
      SELECT * FROM ticket_attachments
      WHERE ticket_id = $1
    `,
      [id]
    );

    const bucketName = process.env.AWS_S3_TICKETS_BUCKET;

    // Generate signed URLs for attachments
    const attachmentsWithSignedUrls = await Promise.all(
      attachmentsResult.rows.map(async (att) => {
        if (att.file_key && bucketName) {
          try {
            const command = new GetObjectCommand({
              Bucket: bucketName,
              Key: att.file_key,
            });
            const signedUrl = await getSignedUrl(s3Client, command, {
              expiresIn: 3600,
            }); // 1 hour
            return { ...att, file_url: signedUrl };
          } catch (s3Error) {
            console.error(`Error signing URL for ${att.file_key}:`, s3Error);
            return att;
          }
        }
        return att;
      })
    );

    const messages = messagesResult.rows.map((msg) => ({
      ...msg,
      attachments: attachmentsWithSignedUrls.filter(
        (att) => att.message_id === msg.id
      ),
    }));

    return NextResponse.json({ ticket, messages });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized / Admin only' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    const result = await query(
      `
      UPDATE tickets
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
