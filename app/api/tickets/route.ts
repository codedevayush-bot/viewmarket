import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { query, dbPool } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let tickets;
    if (session.user.role === "admin") {
      // Admin sees all tickets
      let queryStr = `
        SELECT t.*, u.name as user_name, u.email as user_email
        FROM tickets t
        JOIN users u ON t.user_id = u.id
      `;
      const queryParams = [];

      if (status && status !== "all") {
        queryStr += ` WHERE t.status = $1`;
        queryParams.push(status);
      }

      queryStr += ` ORDER BY t.created_at DESC`;

      const result = await query(queryStr, queryParams);
      tickets = result.rows;
    } else {
      // User sees only their tickets
      let queryStr = `SELECT * FROM tickets WHERE user_id = $1`;
      const queryParams = [session.user.id];

      if (status && status !== "all") {
        queryStr += ` AND status = $2`;
        queryParams.push(status);
      }

      queryStr += ` ORDER BY created_at DESC`;

      const result = await query(queryStr, queryParams);
      tickets = result.rows;
    }

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const client = await dbPool.connect();
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, category, attachments } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await client.query("BEGIN");

    const ticketResult = await client.query(
      `
      INSERT INTO tickets (user_id, title, description, category)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
      [session.user.id, title, description, category],
    );

    const ticketId = ticketResult.rows[0].id;

    const messageResult = await client.query(
      `
      INSERT INTO ticket_messages (ticket_id, sender_id, message)
      VALUES ($1, $2, $3)
      RETURNING id
    `,
      [ticketId, session.user.id, description],
    );

    const messageId = messageResult.rows[0].id;

    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      for (const att of attachments) {
        await client.query(
          `
          INSERT INTO ticket_attachments (message_id, ticket_id, file_name, file_url, file_type, file_size_bytes, file_key)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [
            messageId,
            ticketId,
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
    return NextResponse.json({ id: ticketId }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
