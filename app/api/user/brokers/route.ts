import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await query(
      `SELECT bc.*, b.name as broker_name, b.display_name, b.auth_type
       FROM broker_connections bc
       JOIN brokers b ON bc."brokerId" = b.id
       WHERE bc."userId" = $1`,
      [session.user.id],
    );

    // Filter out the actual encrypted secrets and just return presence or masked values
    const safeConnections = res.rows.map((row) => ({
      id: row.id,
      brokerId: row.brokerId,
      brokerName: row.broker_name,
      displayName: row.display_name,
      accountId: row.account_id,
      isValid: row.is_valid,
      authType: row.auth_type,
      hasApiKey: !!row.api_key,
      hasApiSecret: !!row.api_secret,
      hasAccessToken: !!row.access_token,
      expiresAt: row.token_expires_at,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    return NextResponse.json({ connections: safeConnections });
  } catch (error) {
    console.error("Failed to fetch user brokers:", error);
    return NextResponse.json(
      { error: "Failed to fetch user brokers" },
      { status: 500 },
    );
  }
}
