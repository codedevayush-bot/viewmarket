import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbPool } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const client = await dbPool.connect();
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { message, attachments } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Verify ticket access
    const ticketResult = await client.query(
      `SELECT user_id FROM tickets WHERE id = $1`,
      [id],
    );
    if (ticketResult.rows.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticket = ticketResult.rows[0];
    if (session.user.role !== "admin" && ticket.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await client.query("BEGIN");

    // Insert message
    const messageResult = await client.query(
      `
      INSERT INTO ticket_messages (ticket_id, sender_id, message)
      VALUES ($1, $2, $3)
      RETURNING id, created_at
    `,
      [id, session.user.id, message],
    );

    const messageId = messageResult.rows[0].id;

    // Update ticket updated_at
    await client.query(`UPDATE tickets SET updated_at = NOW() WHERE id = $1`, [
      id,
    ]);

    // Insert attachments
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      for (const att of attachments) {
        await client.query(
          `
          INSERT INTO ticket_attachments (message_id, ticket_id, file_name, file_url, file_type, file_size_bytes, file_key)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [
            messageId,
            id,
            att.fileName,
            att.fileUrl,
            att.fileType,
            att.fileSize,
            att.fileKey,
          ],
        );
      }
    }

    await client.query("COMMIT");
    return NextResponse.json({ success: true, messageId }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error adding ticket message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
