import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";
import { BrokerFactory } from "@/lib/brokers/BrokerFactory";
import { decrypt } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const connectionId = searchParams.get("connectionId");

  if (!connectionId) {
    return NextResponse.json(
      { error: "Missing connectionId" },
      { status: 400 },
    );
  }

  try {
    const res = await query(
      `SELECT bc.*, b.name as broker_name 
       FROM broker_connections bc
       JOIN brokers b ON bc."brokerId" = b.id
       WHERE bc.id = $1 AND bc."userId" = $2`,
      [connectionId, session.user.id],
    );

    if (res.rowCount === 0) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 },
      );
    }

    const connection = res.rows[0];

    // Decrypt credentials
    const credentials = {
      client_id: decrypt(connection.api_key),
      client_secret: decrypt(connection.api_secret),
      // We assume the redirect URI is configured to point back to our callback
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/brokers/callback`,
    };

    // Instantiate adapter
    const adapter = BrokerFactory.createAdapter(
      connection.broker_name,
      credentials,
    );
    const authResult = await adapter.authenticate({});

    if (authResult.isOAuth && authResult.redirectUrl) {
      // Secure the state parameter by encrypting the connectionId
      const { encrypt } = await import("@/lib/encryption");
      const secureState = encrypt(connection.id);

      const redirectUrlWithState = new URL(authResult.redirectUrl);
      redirectUrlWithState.searchParams.set("state", secureState);

      return NextResponse.redirect(redirectUrlWithState.toString());
    } else {
      return NextResponse.json(
        { error: "Not an OAuth broker or no redirect URL provided" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Failed to initiate OAuth:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth" },
      { status: 500 },
    );
  }
}
